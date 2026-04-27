const { types, getHasher } = require('@ocap/mcrypto');
const { fromPublicKey } = require('@ocap/wallet');
const { toBase58, fromTokenToUnit, toBN } = require('@ocap/util');
const { toTypeInfo } = require('@arcblock/did');
const { toStakeAddress } = require('@arcblock/did-util');
const stableStringify = require('json-stable-stringify');
const env = require('../../libs/env');
const { t } = require('../../locales');
const logger = require('../../libs/logger');
const { wallet, client } = require('../../libs/auth');

const Blocklet = require('../../db/blocklet');
const { read, getGasPayerExtra, getBlocklet } = require('../../libs/utils');
const { doBlockletPublish } = require('../../libs/utils');
const { checkDeveloperPassport, getBlockletDidVersion, checkDidWalletVersion } = require('../../libs/auth-utils');
const { attachStoreSignature } = require('../../libs/attach-signature');
const { event, Events } = require('../../events');
const { VERSION_STATUS, REVIEW_TYPE } = require('../../db/constant');
const { systemComment } = require('../../libs/comment');

const cacheMap = {};

/**
 *  附加 meta 签名及 store 签名
 * @param {object} response did-auth 的返回结果
 * @param {array} response.claims
 * @param {object} response.extraParams 前端 did-connect 传递过来的参数
 * @returns {void}
 */
async function attachMetaSignature({ claims, extraParams }) {
  const claim = claims.find((c) => c.type === 'signature');
  const metaData = JSON.parse(cacheMap[claim.digest]);
  delete cacheMap[claim.digest];
  metaData.signatures[0].sig = claim.sig;

  const { blockletId } = extraParams || {};
  // 签名
  await attachStoreSignature(metaData);

  await doBlockletPublish(metaData, blockletId);
}

/**
 * 组装待签名的数据
 * @param {object} response - { userPk, userDid, extraParams } => userPk, userDid是钱包传递过来的, extraParams是前端发送的
 * @param {string} response.userDid - 钱包选中账户的 did
 * @param {string} response.userPk - 钱包选中账户的 pk
 * @param {object} response.extraParams - 前端 did-connect 组件传递过来的额外参数
 * @returns {object} meta signature
 */
async function getMetaSignatureClaim({ userDid: accountDid, userPk: accountPk, extraParams }) {
  const { blockletId, locale, developerDid } = extraParams || {};

  if (!(await Blocklet.isOwner(developerDid, blockletId))) {
    throw new Error('Permission denied');
  }

  const blocklet = await Blocklet.findOne({ id: blockletId });
  if (!blocklet) {
    throw new Error(t('auth.publish.blockletNotFound', locale));
  }
  if (blocklet.status === Blocklet.STATUS.BLOCKED) {
    throw new Error(t('auth.publish.blockletBlocked', locale));
  }

  const canPublish =
    !env.preferences.needReview ||
    blocklet.reviewVersion?.status === VERSION_STATUS.APPROVED ||
    (blocklet.reviewType === REVIEW_TYPE.FIRST && !!blocklet.currentVersion);

  if (!canPublish) {
    throw new Error(`the blocklet [${blocklet.meta?.title || blocklet.did}] is need review`);
  }

  await checkDeveloperPassport(developerDid);
  const { filePath } = await getBlocklet(blockletId);

  const meta = JSON.parse(read(filePath));

  const accountWallet = fromPublicKey(accountPk, toTypeInfo(accountDid));
  const walletJSON = accountWallet.toJSON();

  const signatureData = {
    type: walletJSON.type.pk,
    name: meta.name,
    signer: walletJSON.address,
    pk: toBase58(walletJSON.pk),
    excludes: ['htmlAst', 'lastPublishedAt', 'stats', 'readme'],
    appended: ['htmlAst', 'lastPublishedAt', 'stats', 'readme'],
    created: new Date().toISOString(),
  };

  const { signatures = [] } = meta;

  const data = stableStringify({ ...meta, signatures: [signatureData, ...signatures] });
  const hasher = getHasher(types.HashType.SHA3);
  const digest = toBase58(hasher(data, 1));

  cacheMap[digest] = data;

  return {
    type: 'mime:text/plain',
    description: t('auth.publish.signContent', locale, { name: meta.title || meta.name }),
    data: '',
    digest,
  };
}

async function getStakingClaim({ userDid, userPk, extraParams }) {
  if (env.preferences.permissionMode !== 'staking') {
    return null;
  }

  const { state } = await client.getForgeState({});
  const nonce = `blocklet:${extraParams.did}`;
  const address = toStakeAddress(userDid, wallet.address, nonce);

  // FIXME: @wangshijun the stake amount should be different for each paid blocklet
  let amount = fromTokenToUnit(+env.preferences.publishStakeAmount, state.token.decimal).toString();

  // check for existing stake amount for each publish
  const result = await client.getStakeState({ address });
  if (result.state && result.state.tokens.length) {
    const staked = result.state.tokens.find((x) => x.address === state.token.address);
    if (staked) {
      if (toBN(staked.value).gte(toBN(amount))) {
        return null;
      }

      // we need to append stake if the existing stake is less than required
      amount = toBN(amount).sub(toBN(staked.value)).toString();
    }
  }

  const waitingPeriod = +env.preferences.publishRevokeWaitingDays * 24 * 60 * 60;

  return {
    type: 'StakeTx',
    description: t('auth.publish.stake', extraParams.locale),
    partialTx: {
      from: userDid,
      pk: userPk,
      itx: {
        address,
        receiver: wallet.address,
        slashers: [wallet.address],
        revokeWaitingPeriod: waitingPeriod,
        message: `Publish blocklet ${extraParams.did}`,
        nonce,
        inputs: [],
        data: {
          type: 'json',
          value: {
            purpose: 'publish',
            blocklet: extraParams.did,
          },
        },
      },
      signatures: [],
    },
    requirement: {
      tokens: [{ address: state.token.address, value: amount }],
    },
  };
}

async function onConnect({ userDid, userPk, didwallet, extraParams }) {
  checkDidWalletVersion({ didwallet, extraParams });

  const claims = {
    signature: await getMetaSignatureClaim({ userDid, userPk, extraParams }),
    prepareTx: await getStakingClaim({ userDid, userPk, extraParams }),
  };

  if (!claims.prepareTx) {
    delete claims.prepareTx;
  }

  return claims;
}

async function onAuth({ request, userDid, userPk, claims, extraParams }) {
  const { did: blockletDid, blockletId, locale } = extraParams || {};
  logger.info('publish.onAuth', { userDid, userPk, claims });

  // waiting staked and meta signature success to publish
  const signature = claims.find((x) => x.type === 'signature' && x.typeUrl === 'mime:text/plain');
  if (!signature) {
    throw new Error(t('auth.publish.signatureNotFound', locale));
  }

  // publish staking
  const stake = claims.find((x) => x.type === 'prepareTx');
  if (stake) {
    const tx = client.decodeTx(stake.finalTx);
    const { buffer } = await client.encodeStakeTx({ tx });
    const txHash = await client.sendStakeTx(
      { tx, wallet: fromPublicKey(userPk, toTypeInfo(userDid)) },
      await getGasPayerExtra(buffer, client.pickGasPayerHeaders(request))
    );
    logger.info('blocklet publish staked', { blockletDid, txHash });
  }

  // waiting staked and meta signature success to publish
  await attachMetaSignature({ claims: [signature], extraParams });

  const blocklet = await Blocklet.findOne({ id: blockletId });
  const { currentVersion } = blocklet;
  if (currentVersion.pendingAt) {
    systemComment({ reviewId: currentVersion.id, text: '🚀 Published !', color: '#9C27B0' });
  }

  // publish events
  event.emit(Events.BLOCKLET_PUBLISHED, {
    blockletDid,
    blockletId,
    locale,
  });
}

/**
 *
 * @param {object} response claims 参数
 * @param {object} response.extraParams 前端 did-connect 传递过来的参数
 * @returns {{
 *    target?: string;
 *    description: string;
 * }}
 */
async function publishAuthPrincipal({ extraParams }) {
  const { blockletId, locale, did } = extraParams || {};

  const blocklet = await Blocklet.findOne({ id: blockletId });
  if (!blocklet) {
    throw new Error(t('auth.publish.blockletNotFound', locale));
  }
  if (blocklet.status === Blocklet.STATUS.BLOCKED) {
    throw new Error(t('auth.publish.blockletBlocked', locale));
  }
  const didVersion = await getBlockletDidVersion(did);

  if (didVersion === 2) {
    return {
      description: 'Connect your DID Wallet to continue',
      target: did,
    };
  }
  return {
    description: 'Connect your DID Wallet to continue',
  };
}

module.exports = {
  publishFreeBlocklet: {
    action: 'free-publish-blocklet',
    claims: {
      authPrincipal: publishAuthPrincipal,
    },
    onConnect,
    onAuth,
  },

  publishPaidBlocklet: {
    action: 'paid-publish-blocklet',
    claims: {
      authPrincipal: publishAuthPrincipal,
    },
    onConnect,
    onAuth,
  },
};
