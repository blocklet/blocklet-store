const { types } = require('@ocap/mcrypto');
const { fromSecretKey } = require('@ocap/wallet');
const { fromBase58, toBase58 } = require('@ocap/util');
const logger = require('../../libs/logger');
const env = require('../../libs/env');
const { service, wallet } = require('../../libs/auth');
const AccessToken = require('../../db/access-token');
const {
  getDeveloperStakeClaim,
  handleDeveloperStakeClaim,
  checkDidWalletVersion,
  checkDeveloperPassport,
} = require('../../libs/auth-utils');
const { t } = require('../../locales');

module.exports = {
  action: 'connect-studio',

  onConnect: async ({ userDid, userPk, didwallet, extraParams }) => {
    const claims = {};

    checkDidWalletVersion({ didwallet, extraParams });

    if (env.preferences?.permissionMode === 'inviting') {
      await checkDeveloperPassport(userDid);
    } else {
      try {
        const result = await getDeveloperStakeClaim({ userDid, userPk, extraParams });
        Object.assign(claims, result);
      } catch (err) {
        if (['USER_BLOCKED'].includes(err.code)) {
          throw err;
        }

        logger.error('connectStudio.getDeveloperStakeClaim.error', err);
      }
    }

    claims.keyPair = {
      mfa: false,
      description: t('auth.error.generateDidForNewBlocklet', extraParams.locale || 'en'),
      moniker: extraParams.monikers,
      targetType: {
        role: 'blocklet',
        hash: 'sha3',
        key: 'ed25519',
        encoding: 'base58',
      },
    };

    return claims;
  },

  onAuth: async ({ request, userDid, userPk, claims, extraParams, updateSession }) => {
    // auto generate passport
    await handleDeveloperStakeClaim({ request, userDid, userPk, claims, extraParams });

    // generated blocklet key pair
    const keyPair = claims.find((x) => x.type === 'keyPair');
    const blocklet = fromSecretKey(fromBase58(keyPair.secret), { role: types.RoleType.ROLE_BLOCKLET });

    // generate access token
    const data = await AccessToken.create({ userDid, remark: 'generated-for-studio' });
    logger.info('claim.connectStudio.done', { address: blocklet.address, publicKey: toBase58(blocklet.publicKey) });

    const { user } = await service.getUser(userDid);
    await updateSession(
      {
        config: {
          store: {
            appId: wallet.address,
          },
          blocklet: {
            address: blocklet.address,
            publicKey: toBase58(blocklet.publicKey),
          },
          developer: {
            developerDid: userDid,
            secretKey: data.secretKey,
            email: user.email,
            name: user.fullName,
          },
        },
      },
      true
    );
  },
};
