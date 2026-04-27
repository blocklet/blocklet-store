const { toBase64, fromBase58, toHex } = require('@ocap/util');
const { sign, verify } = require('@arcblock/jwt');
const dayjs = require('dayjs');
const assert = require('assert');
const { event, Events } = require('../../events/index');
const Blocklet = require('../../db/blocklet');
const logger = require('../../libs/logger');
const { wallet } = require('../../libs/auth');
const { t } = require('../../locales');
const { getBlockletName } = require('../../libs/blocklet-utils');
const { getBlockletDidVersion } = require('../../libs/auth-utils');

// 配置自动发布流程
module.exports = {
  action: 'enable-auto-publish',
  claims: [
    {
      authPrincipal: async ({ extraParams }) => {
        const { did } = extraParams;
        const didVersion = await getBlockletDidVersion(did);
        if (didVersion === 2) {
          return {
            description: 'Please select the required DID',
            target: did,
          };
        }
        return {
          description: 'Please select the required DID',
        };
      },
    },
    {
      signature: async ({ userDid: accountDid, userPk: accountPk, extraParams }) => {
        const { id: blockletId, developerDid } = extraParams;
        if (!(await Blocklet.isOwner(developerDid, blockletId))) {
          throw new Error('Permission denied');
        }

        const blocklet = await Blocklet.findOne({
          ownerDid: developerDid,
          id: blockletId,
        });
        const storeDid = wallet.address;
        const { locale } = extraParams;

        // 生成token的header和payload
        const headerAndPayload = await sign(
          accountDid,
          undefined,
          {
            from: accountDid,
            to: storeDid,
            userPk: accountPk,
            permissions: ['publish_blocklet'],
            exp: dayjs().add('100', 'year').toDate().getTime() / 1000,
            version: '1.1.0',
          },
          false
        );

        const data = toHex(headerAndPayload);

        return {
          type: 'fg:x:delegation',
          description: t('auth.autoPublish.signDescription', locale, {
            name: getBlockletName(blocklet),
          }),
          mfa: true,
          data,
          meta: {
            headerAndPayload,
          },
        };
      },
    },
  ],
  onAuth: async ({ userPk: accountPk, claims, extraParams }) => {
    const { locale, did: blockletDid } = extraParams;

    // 找到签名返回的结果
    const claim = claims.find((c) => c.type === 'signature');
    if (!claim?.meta) {
      throw new Error('Parse delegation token failed');
    }
    // 构造delegation token
    const token = `${claim.meta.headerAndPayload}.${toBase64(fromBase58(claim.sig))}`;
    // 验证一下生成的delegation token是否有误
    assert(await verify(token, fromBase58(accountPk)), 'delegation verify failed');

    const blocklet = await Blocklet.findOne({ did: blockletDid });
    const delegationToken = blocklet?.delegationToken ? blocklet.delegationToken : {};
    delegationToken.autoPublish = token;
    await Blocklet.update(
      {
        did: blockletDid,
      },
      { $set: { delegationToken } }
    );

    logger.info('enable-auto-publish.onAuth', `autoPublish token generated successfully: ${blockletDid}`);
    // 告知blocklet的developer,blocklet已经启动自动发布了
    event.emit(Events.BLOCKLET_ENABLED_AUTO_PUBLISH, { blockletDid, locale });

    return {
      successMessage: `You have signed auto-publish delegation for ${blockletDid}`,
    };
  },
};
