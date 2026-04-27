const Notification = require('@blocklet/sdk/service/notification');
const { toDid } = require('@ocap/util');
const { service } = require('../auth');

const logger = require('../logger');
const { createTranslateFunc } = require('../../locales');
const { sendNotification, createInfoTable } = require('./base');

const rewriteSendToUser =
  (func) =>
  async (...args) => {
    try {
      await func(...args);
    } catch (error) {
      logger.error('sendToUser error', error, { reserver: args?.[0], content: args?.[1] });
    }
  };

const init = () => {
  const innerNotification = Notification;
  innerNotification.sendToUser = rewriteSendToUser(innerNotification.sendToUser);
  return innerNotification;
};

const getUserLocale = async (userDid) => {
  const { user } = await service.getUser(userDid);

  return user?.locale || 'en';
};

const sendMintNFTNotification = async ({ nftDid, to, chainHost }) => {
  const locale = await getUserLocale(to);
  const t = createTranslateFunc(locale);

  const data = {
    to,
    title: t('notification.mintNFT.title'),
    message: t('notification.mintNFT.message'),
    attachments: [
      {
        type: 'asset',
        data: {
          chainHost,
          did: nftDid,
        },
      },
      createInfoTable({
        [t('notification.sendTo')]: toDid(to),
      }),
    ],
    actions: [],
  };

  await sendNotification(data);
};

module.exports = init();
module.exports.sendMintNFTNotification = sendMintNFTNotification;
