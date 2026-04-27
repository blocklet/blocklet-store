const { toTypeInfo, types } = require('@arcblock/did');
const { toStakeAddress } = require('@arcblock/did-util');
const { fromTokenToUnit, toBN } = require('@ocap/util');
const { fromPublicKey } = require('@ocap/wallet');
const semver = require('semver');

const logger = require('./logger');
const { t } = require('../locales');
const { event, Events } = require('../events');

const { service, client, wallet } = require('./auth');
const { toBlockletDid, getGasPayerExtra, checkDeveloperPassport } = require('./utils');
const env = require('./env');
const Blocklet = require('../db/blocklet');

class CustomError extends Error {
  constructor(code = 'GENERIC', ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.code = code;
  }
}

module.exports = {
  async checkDeveloperPassport(userDid, locale = 'en') {
    const { user } = await service.getUser(userDid);
    if (!user) {
      if (env.preferences?.permissionMode === 'inviting') {
        throw new CustomError('NEED_INVITE', t('auth.error.needInvite', locale));
      }

      throw new CustomError('USER_NOT_FOUND', t('auth.error.userNotFound', locale));
    }
    if (user.approved === false) {
      throw new CustomError('USER_BLOCKED', t('auth.error.userBlocked', locale));
    }
    if (!checkDeveloperPassport(user.passports)) {
      throw new CustomError('PASSPORT_NOT_FOUND', t('auth.error.passportNotFound', locale));
    }
  },

  checkDidWalletVersion({ didwallet, extraParams }) {
    const { locale = 'en' } = extraParams;

    const requirements = {
      web: '>=4.12.6',
      ios: '>=5.4.13',
      android: '>=5.4.14',
    };

    const actual = didwallet.version;
    const expected = requirements[didwallet.os];
    if (actual && expected && semver.satisfies(actual, expected)) {
      return true;
    }

    throw new CustomError('DID_WALLET_OUTDATED', t('auth.error.didWalletOutdated', locale));
  },

  async getDeveloperStakeClaim({ userDid, userPk, extraParams }) {
    const { locale = 'en' } = extraParams;

    if (env.preferences?.permissionMode === 'inviting') {
      throw new CustomError('NEED_INVITE', t('auth.error.needInvite', locale));
    }

    const { state } = await client.getForgeState({});
    const claims = {};

    const nonce = `developer:${userDid}`;
    const address = toStakeAddress(userDid, wallet.address, nonce);
    const amount = fromTokenToUnit(+env.preferences.passportStakeAmount, state.token.decimal).toString();
    const waitingPeriod = +env.preferences.passportRevokeWaitingDays * 24 * 60 * 60;

    const { user } = await service.getUser(userDid);
    if (user) {
      if (user.approved === false) {
        throw new CustomError('USER_BLOCKED', t('auth.error.userBlocked', locale));
      }
      const isDeveloper = checkDeveloperPassport(user.passports);
      if (isDeveloper) {
        throw new CustomError('PASSPORT_EXIST', t('auth.error.passportExist', locale));
      }

      const result = await client.getStakeState({ address });
      if (result.state && result.state.tokens) {
        const actual = toBN(result.state.tokens.find((x) => x.address === state.token.address)?.value || 0);
        if (actual.gte(toBN(amount))) {
          throw new CustomError('STAKE_EXIST', t('auth.error.stakeExist', locale));
        }
      }
    } else {
      claims.profile = {
        description: t('auth.joined.profile', locale),
        fields: ['fullName', 'avatar', 'email'],
      };
    }

    claims.staking = [
      'prepareTx',
      {
        type: 'StakeTx',
        description: t('auth.joined.scanDescription', locale),
        partialTx: {
          from: userDid,
          pk: userPk,
          itx: {
            address,
            receiver: wallet.address,
            slashers: [wallet.address],
            revokeWaitingPeriod: waitingPeriod,
            message: t('auth.joined.stakeMessage', locale),
            nonce,
            inputs: [],
            data: {
              type: 'json',
              value: {
                purpose: 'passport',
                developer: userDid,
              },
            },
          },
          signatures: [],
        },
        requirement: {
          tokens: [{ address: state.token.address, value: amount }],
        },
      },
    ];

    return claims;
  },

  async handleDeveloperStakeClaim({ request, userDid, userPk, claims, extraParams }) {
    logger.info('developer joining', { userDid, claims, extraParams });
    const profile = claims.find((x) => x.type === 'profile');
    if (profile) {
      await service.login({
        provider: 'wallet',
        avatar: profile.avatar,
        email: profile.email,
        fullName: profile.fullName,
        did: userDid,
        pk: userPk,
      });
      logger.info('developer joined', { userDid });
    }

    const stake = claims.find((x) => x.type === 'prepareTx');
    if (!stake) {
      return;
    }

    const tx = client.decodeTx(stake.finalTx);
    if (stake.sig) {
      tx.signature = stake.sig;
    }

    const { buffer } = await client.encodeStakeTx({ tx });

    const txHash = await client.sendStakeTx(
      { tx, wallet: fromPublicKey(userPk, toTypeInfo(userDid)) },
      await getGasPayerExtra(buffer, client.pickGasPayerHeaders(request))
    );
    logger.info('developer staked', { userDid, txHash });

    await service.issuePassportToUser({ userDid, role: 'developer' });
    logger.info('developer certified', { userDid });

    event.emit(Events.DEVELOPER_JOINED, {
      userDid,
      locale: extraParams?.locale,
    });
  },

  /**
   * 通过 did 地址来判断当前 blockletDid 的版本
   * 1 代表根据 name 生成的
   * 2 代表有钱包随机生成的
   * @param {string} did 需要判断的 did 地址
   * @returns {number} 1 | 2 blockletDid 的版本
   */
  async getBlockletDidVersion(did) {
    if (!did?.trim()) {
      throw new Error('DID should not be empty');
    }
    const blocklet = await Blocklet.findOne({ did });
    if (toBlockletDid(blocklet?.meta?.name) === did) {
      return 1;
    }
    const typeInfo = toTypeInfo(did);
    if (typeInfo.role === types.RoleType.ROLE_BLOCKLET) {
      return 2;
    }
    throw new Error(`Invalid DID: ${did}`);
  },
};
