const axios = require('axios');
const { joinURL } = require('ufo');

const { get, isEmpty } = require('lodash-es');
const env = require('@blocklet/sdk/lib/env');
const logger = require('../../libs/logger');
const { wallet } = require('../../libs/auth');
const { getVCFromClaim, signDownloadToken, PurchaseVcTypes } = require('../../libs/utils');
const { t } = require('../../locales');
const Blocklet = require('../../db/blocklet');

const TrustedIssuers = env.appIds || [];

// 配置自动发布流程
module.exports = {
  action: 'verify-purchase-blocklet',
  claims: [
    {
      verifiableCredential: ({ extraParams }) => {
        if (isEmpty(extraParams.serverDid)) {
          throw new Error(
            t('common.parameterMustExistIn', extraParams.locale, { param: 'serverDid', params: 'extraParams' })
          );
        }

        if (isEmpty(extraParams.blockletDid)) {
          throw new Error(
            t('common.parameterMustExistIn', extraParams.locale, { param: 'blockletDid', params: 'extraParams' })
          );
        }

        return {
          description: t('auth.verifyPurchaseBlocklet.blockletPurchaseNftDescription', extraParams.locale),
          item: PurchaseVcTypes,
          trustedIssuers: TrustedIssuers,
          tag: extraParams.blockletDid,
        };
      },
    },
  ],
  onAuth: async (options) => {
    const { userDid, extraParams, updateSession, claims, challenge } = options;
    const { locale = 'en' } = extraParams;

    const vcClaim = claims.find(
      (x) => x.type === 'verifiableCredential' && PurchaseVcTypes.some((item) => x.item.includes(item))
    );

    const { vc } = await getVCFromClaim({
      claim: vcClaim,
      challenge,
      trustedIssuers: TrustedIssuers,
      vcTypes: PurchaseVcTypes,
      locale,
    });

    const blockletDid = get(vc, 'credentialSubject.purchased.blocklet.id');

    if (blockletDid !== extraParams.blockletDid) {
      throw new Error(
        {
          en: 'blockletDid is does not match with vc',
          zh: 'blockletDid 和 vc 不匹配',
        }[locale]
      );
    }

    const blocklet = await Blocklet.findOne({ did: blockletDid });

    if (!blocklet) {
      throw new Error(
        {
          en: 'blocklet does not exist',
          zh: 'blocklet 不存在',
        }[locale]
      );
    }

    const { dependentStores } = blocklet;

    let tokenList = [];
    try {
      tokenList = await Promise.all(
        (dependentStores || []).map(async ({ url }) => {
          const { data } = await axios.post(
            joinURL(url, '/api/payment/download-token'),
            {
              userDid,
              serverDid: extraParams.serverDid,
              vcClaim,
              challenge,
              vcIssuer: {
                pk: wallet.publicKey,
                token: await wallet.signJWT({}),
              },
            },
            { timeout: 8 * 1000 }
          );

          if (!data.downloadTokens || !data.downloadTokens.length) {
            throw new Error(`cannot get downloadTokens from ${url}`);
          }

          return data.downloadTokens;
        })
      );
    } catch (err) {
      const msg = err.response ? err.response.data : err.message;
      throw new Error(msg);
    }

    const downloadTokenList = [
      {
        did: blockletDid,
        token: await signDownloadToken({
          wallet,
          blockletDid: extraParams.blockletDid,
          serverDid: extraParams.serverDid,
          userDid,
        }),
      },
      ...tokenList.flat(),
    ];

    logger.info('/verify-purchase-blocklet: downloadTokens', { dids: downloadTokenList.map((x) => x.did) });

    if (!isEmpty(extraParams.nw)) {
      return {
        nextWorkflowData: {
          downloadTokenList,
        },
      };
    }

    // @description 第一个参数表示传递的数据,第二个参数表示是否需要加密
    await updateSession({ downloadTokenList }, true);

    return null;
  },
};
