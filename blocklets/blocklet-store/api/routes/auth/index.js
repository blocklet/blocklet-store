const { walletHandlers } = require('../../libs/auth');
const { publishFreeBlocklet, publishPaidBlocklet } = require('./publish-blocklet');
const connectCliHandler = require('./connect-cli');
const createDidHandler = require('./create-did');
const connectStudioHandler = require('./connect-studio');
const enableAutoPublish = require('./enable-auto-publish');
const stakeAndJoin = require('./stake-and-join');
const verifyPurchaseBlocklet = require('./verify-purchase-blocklet');

module.exports = {
  init(app) {
    walletHandlers.attach({ app, ...publishFreeBlocklet });
    walletHandlers.attach({ app, ...publishPaidBlocklet });
    walletHandlers.attach({ app, ...enableAutoPublish });
    walletHandlers.attach({ app, ...connectCliHandler });
    walletHandlers.attach({ app, ...createDidHandler });
    walletHandlers.attach({ app, ...connectStudioHandler });
    walletHandlers.attach({ app, ...stakeAndJoin });
    walletHandlers.attach({ app, ...verifyPurchaseBlocklet });
  },
};
