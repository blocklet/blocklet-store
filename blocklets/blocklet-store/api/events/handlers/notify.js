const { env } = require('@blocklet/sdk/lib/env');
const { event, Events } = require('../event');
const {
  getBlockletName,
  getBlockletReleasedVersion,
  getBlockletUrl,
  getBlockletOwner,
  getBlockletLatestVersion,
  getBlockletOwnerName,
} = require('../../libs/blocklet-utils');
const { t } = require('../../locales');
const { chainHost } = require('../../libs/env');
const Blocklet = require('../../db/blocklet');
const { service } = require('../../libs/auth');
const Notification = require('../../libs/notification');
const logger = require('../../libs/logger');
const { VERSION_STATUS } = require('../../db/constant');
const ws = require('../../libs/ws');

const { appId } = env;

async function getStoreOwner() {
  // 获取store的owner
  const { user: storeOwner } = await service.getOwner();
  if (!storeOwner) {
    throw new Error('store owner does not exist');
  }

  return storeOwner;
}

const DEFAULT_LOCALE = 'en';

const notifyHandlers = {
  [Events.BLOCKLET_CREATED]: async ({ blockletDid, locale = DEFAULT_LOCALE }) => {
    const blocklet = await Blocklet.findOne({
      did: blockletDid,
    });

    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);

    await Notification.sendToUser(ownerDid, {
      title: t('auth.create.successTitle', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      body: t('auth.create.successDescription', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
    });

    try {
      // 给store发送通知
      const storeOwner = await getStoreOwner();
      if (storeOwner.did !== ownerDid) {
        const storeOwnerLocale = storeOwner.locale || locale;
        await Notification.sendToUser(storeOwner.did, {
          title: t('auth.create.successTitleForStoreOwner', storeOwnerLocale, {
            blockletName: getBlockletName(blocklet),
          }),
          body: t('auth.create.successDescriptionForStoreOwner', storeOwnerLocale, {
            developerDid: getBlockletOwner(blocklet),
            blockletName: getBlockletName(blocklet),
          }),
        });
      }
    } catch {
      logger.error('Fail to send notification to store-owner');
    }
  },
  [Events.BLOCKLET_ENABLED_AUTO_PUBLISH]: async ({ blockletDid, locale = DEFAULT_LOCALE }) => {
    const blocklet = await Blocklet.findOne({
      did: blockletDid,
    });

    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);
    await Notification.sendToUser(ownerDid, {
      title: t('auth.autoPublish.enableTitle', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      body: t('auth.autoPublish.enableDescription', ownerLocale, {
        blockletName: getBlockletName(blocklet),
        blockletReleasedVersion: getBlockletReleasedVersion(blocklet),
      }),
      actions: [
        {
          name: t('common.viewBlocklet', ownerLocale),
          link: getBlockletUrl(blocklet),
        },
      ],
    });
  },
  [Events.BLOCKLET_NFT_FACTORY_CHANGED]: async ({ blockletDid, locale = DEFAULT_LOCALE }) => {
    const blocklet = await Blocklet.findOne({
      did: blockletDid,
    });

    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);
    await Notification.sendToUser(ownerDid, {
      title: t('auth.autoPublish.enabledButNftFactoryChangeTitle', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      body: t('auth.autoPublish.enabledButNftFactoryChangeDescription', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      actions: [
        {
          name: t('common.viewBlocklet', ownerLocale),
          link: getBlockletUrl(blocklet),
        },
      ],
    });
  },
  [Events.BLOCKLET_DISABLED_AUTO_PUBLISH]: async ({ blockletDid, locale = DEFAULT_LOCALE }) => {
    const blocklet = await Blocklet.findOne({
      did: blockletDid,
    });

    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);
    await Notification.sendToUser(ownerDid, {
      title: t('auth.autoPublish.disableTitle', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      body: t('auth.autoPublish.disableDescription', ownerLocale, {
        blockletName: getBlockletName(blocklet),
        blockletReleasedVersion: getBlockletReleasedVersion(blocklet),
      }),
      actions: [
        {
          name: t('common.viewBlocklet', ownerLocale),
          link: getBlockletUrl(blocklet),
        },
      ],
    });
  },
  [Events.BLOCKLET_REVIEWED]: async ({ blockletId, locale = DEFAULT_LOCALE, action }) => {
    const blocklet = await Blocklet.findOne({
      id: blockletId,
    });

    const blockletName = getBlockletName(blocklet);
    const version = blocklet.reviewVersion?.version;
    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);

    const { users: admins = [] } = await service.getUsers({ query: { role: 'admin' } });
    const notifyList = {};

    const zhReceivers = admins.filter((u) => u.locale === 'zh')?.map((u) => u.did);
    const enReceivers = admins.filter((u) => u.locale === 'en')?.map((u) => u.did);

    switch (action) {
      case VERSION_STATUS.PENDING_REVIEW:
        if (zhReceivers.length) {
          notifyList.zh = {
            title: t('blocklet.reviewed.pendingReviewTitle', 'zh', { blockletName }),
            body: t('blocklet.reviewed.pendingReviewDescription', 'zh', { blockletName, version }),
            receiver: zhReceivers,
          };
        }
        if (enReceivers.length) {
          notifyList.en = {
            title: t('blocklet.reviewed.pendingReviewTitle', 'en', { blockletName }),
            body: t('blocklet.reviewed.pendingReviewDescription', 'en', { blockletName, version }),
            receiver: enReceivers,
          };
        }
        break;
      case VERSION_STATUS.IN_REVIEW:
        notifyList[ownerLocale] = {
          title: t('blocklet.reviewed.inReviewTitle', ownerLocale, { blockletName }),
          body: t('blocklet.reviewed.inReviewDescription', ownerLocale, { blockletName, version }),
          receiver: ownerDid,
        };
        break;
      case VERSION_STATUS.APPROVED:
        notifyList[ownerLocale] = {
          title: t('blocklet.reviewed.approvedTitle', ownerLocale, { blockletName }),
          body: t('blocklet.reviewed.approvedDescription', ownerLocale, { blockletName, version }),
          receiver: ownerDid,
        };
        break;
      case VERSION_STATUS.REJECTED:
        notifyList[ownerLocale] = {
          title: t('blocklet.reviewed.rejectedTitle', ownerLocale, { blockletName }),
          body: t('blocklet.reviewed.rejectedDescription', ownerLocale, { blockletName, version }),
          receiver: ownerDid,
        };
        break;
      case VERSION_STATUS.CANCELLED:
        if (zhReceivers.length) {
          notifyList.zh = {
            title: t('blocklet.reviewed.cancelledTitle', 'zh', { blockletName }),
            body: t('blocklet.reviewed.cancelledDescription', 'zh', { blockletName, version }),
            receiver: zhReceivers,
          };
        }
        if (enReceivers.length) {
          notifyList.en = {
            title: t('blocklet.reviewed.cancelledTitle', 'en', { blockletName }),
            body: t('blocklet.reviewed.cancelledDescription', 'en', { blockletName, version }),
            receiver: enReceivers,
          };
        }
        break;
      default:
        break;
    }

    ws.broadcast(ownerDid, Events.BLOCKLET_REVIEWED, {
      status: action,
      blockletId,
    });

    Object.entries(notifyList).forEach(([tLocale, { title, body, receiver }]) => {
      if (receiver) {
        Notification.sendToUser(receiver, {
          title,
          body,
          actions: [
            {
              name: t('common.viewBlocklet', tLocale),
              link: getBlockletUrl(blocklet, version),
            },
          ],
        });
      }
    });
  },
  [Events.BLOCKLET_PUBLISHED]: async ({ blockletDid, locale = DEFAULT_LOCALE }) => {
    const blocklet = await Blocklet.findOne({
      did: blockletDid,
    });
    // 通知 developer,应用已发布
    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);
    await Notification.sendToUser(ownerDid, {
      title: t('auth.publish.successTitle', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      body: t('auth.publish.successDescription', ownerLocale, {
        blockletName: getBlockletName(blocklet),
        blockletLatestVersion: getBlockletLatestVersion(blocklet),
      }),
      actions: [
        {
          name: t('common.viewBlocklet', ownerLocale),
          link: getBlockletUrl(blocklet),
        },
      ],
    });

    try {
      // 给store发送通知
      const storeOwner = await getStoreOwner();
      if (storeOwner.did !== ownerDid) {
        const storeOwnerLocale = storeOwner.locale || locale;
        await Notification.sendToUser(storeOwner.did, {
          title: t('auth.publish.successTitleForStoreOwner', storeOwnerLocale, {
            blockletName: getBlockletName(blocklet),
          }),
          body: t('auth.publish.successDescriptionForStoreOwner', storeOwnerLocale, {
            userInfo: await getBlockletOwnerName(blocklet),
            blockletName: getBlockletName(blocklet),
            blockletLatestVersion: getBlockletLatestVersion(blocklet),
          }),
          actions: [
            {
              name: t('common.viewBlocklet', storeOwnerLocale),
              link: getBlockletUrl(blocklet),
            },
          ],
        });
      }
    } catch {
      logger.error('Fail to send notification to store-owner');
    }
  },
  [Events.BLOCKLET_AUTO_PUBLISHED]: async ({ blockletDid, locale = DEFAULT_LOCALE }) => {
    const blocklet = await Blocklet.findOne({
      did: blockletDid,
    });

    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);
    await Notification.sendToUser(ownerDid, {
      title: t('auth.autoPublish.successTitle', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      body: t('auth.autoPublish.successDescription', ownerLocale, {
        blockletName: getBlockletName(blocklet),
        blockletLatestVersion: getBlockletLatestVersion(blocklet),
      }),
      actions: [
        {
          name: t('common.viewBlocklet', ownerLocale),
          link: getBlockletUrl(blocklet),
        },
      ],
    });

    try {
      // 给store发送通知
      const storeOwner = await getStoreOwner();
      if (storeOwner.did !== ownerDid) {
        const storeOwnerLocale = storeOwner.locale || locale;
        await Notification.sendToUser(storeOwner.did, {
          title: t('auth.autoPublish.successTitleForStoreOwner', storeOwnerLocale, {
            blockletName: getBlockletName(blocklet),
          }),
          body: t('auth.autoPublish.successDescriptionForStoreOwner', storeOwnerLocale, {
            userInfo: await getBlockletOwnerName(blocklet),
            blockletName: getBlockletName(blocklet),
            blockletLatestVersion: getBlockletLatestVersion(blocklet),
          }),
          actions: [
            {
              name: t('common.viewBlocklet', storeOwnerLocale),
              link: getBlockletUrl(blocklet),
            },
          ],
        });
      }
    } catch {
      logger.error('Fail to send notification to store-owner');
    }
  },

  [Events.BLOCKLET_PURCHASED]: async ({ blockletDid, locale = DEFAULT_LOCALE, transaction }) => {
    const blocklet = await Blocklet.findOne({
      did: blockletDid,
    });

    const { purchaserDid, profitMap, txHash } = transaction;
    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);

    const profitMessage = Object.values(profitMap[ownerDid]).map((p) => `${p.profit} ${p.currency}`);

    await Notification.sendToUser(ownerDid, {
      title: t('auth.purchase.successTitle', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      body: t('auth.purchase.successDescription', ownerLocale, {
        purchaserDid,
        blockletName: getBlockletName(blocklet),
        profitMessage,
      }),
      actions: [
        {
          name: t('common.viewTransaction', ownerLocale),
          link: `${chainHost.replace('/api/', '')}/explorer/txs/${txHash}`,
        },
      ],
    });

    try {
      // 给store发送通知
      const storeOwner = await getStoreOwner();
      const storeOwnerLocale = storeOwner.locale || locale;

      const storeProfitMessage = Object.values(profitMap[appId]).map((p) => `${p.profit} ${p.currency}`);

      await Notification.sendToUser(storeOwner.did, {
        title: t('auth.purchase.successTitleForStoreOwner', storeOwnerLocale, {
          blockletName: getBlockletName(blocklet),
        }),
        body: t('auth.purchase.successDescriptionForStoreOwner', storeOwnerLocale, {
          purchaserDid,
          blockletName: getBlockletName(blocklet),
          profitMessage: storeProfitMessage,
          appId,
        }),
        actions: [
          {
            name: t('common.viewTransaction', storeOwnerLocale),
            link: `${chainHost.replace('/api/', '')}/explorer/txs/${txHash}`,
          },
        ],
      });
    } catch {
      logger.error('Fail to send notification to store-owner');
    }
  },

  [Events.DEVELOPER_JOINED]: async ({ userDid, locale = DEFAULT_LOCALE }) => {
    try {
      const storeOwner = await getStoreOwner();
      const storeOwnerLocale = storeOwner.locale || locale;

      const { user } = await service.getUser(userDid);
      const fullNameOrUserDid = user?.fullName || userDid;

      await Notification.sendToUser(storeOwner.did, {
        title: t('auth.joined.successTitleForStoreOwner', storeOwnerLocale, {
          fullNameOrUserDid,
        }),
        body: t('auth.joined.successDescriptionForStoreOwner', storeOwnerLocale, {
          userDid,
          source: 'NFT',
        }),
      });
    } catch {
      logger.error('Fail to send notification to store-owner');
    }
  },

  [Events.BLOCKLET_BLOCKED]: async ({ blockletId, locale = DEFAULT_LOCALE }) => {
    const blocklet = await Blocklet.findOne({
      id: blockletId,
    });

    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);

    await Notification.sendToUser(ownerDid, {
      title: t('blocklet.blocked.title', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      body: t('blocklet.blocked.description', ownerLocale, {
        reason: blocklet.blockReason,
      }),
      actions: [
        {
          name: t('common.viewBlocklet', ownerLocale),
          link: getBlockletUrl(blocklet),
        },
      ],
    });
  },
  [Events.BLOCKLET_UNBLOCKED]: async ({ blockletId, locale = DEFAULT_LOCALE }) => {
    const blocklet = await Blocklet.findOne({
      id: blockletId,
    });

    const { did: ownerDid, locale: ownerLocale } = await getBlockletOwner(blocklet, locale);

    await Notification.sendToUser(ownerDid, {
      title: t('blocklet.unBlocked.title', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      body: t('blocklet.unBlocked.title', ownerLocale, {
        blockletName: getBlockletName(blocklet),
      }),
      actions: [
        {
          name: t('common.viewBlocklet', ownerLocale),
          link: getBlockletUrl(blocklet),
        },
      ],
    });
  },
};

// 订阅事件
Object.keys(notifyHandlers).forEach((key) => event.on(key, notifyHandlers[key]));
