const path = require('path');
const GraphQLClient = require('@ocap/client');
const { getWallet } = require('@blocklet/sdk/lib/wallet');
const AuthNedbStorage = require('@arcblock/did-connect-storage-nedb');
const { WalletAuthenticator } = require('@blocklet/sdk/lib/wallet-authenticator');
const { WalletHandlers } = require('@blocklet/sdk/lib/wallet-handler');
const { BlockletService } = require('@blocklet/sdk/lib/service/blocklet');

const env = require('./env');
const logger = require('./logger');

const client = new GraphQLClient(env.chainHost);

const wallet = getWallet(); // 这里是store 的wallet

const authenticator = new WalletAuthenticator();

const dbOnload = (err, dbName) => {
  if (err) {
    logger.error(`Failed to load database from ${path.join(process.env.BLOCKLET_DATA_DIR || './', dbName)}`, err);
  }
};

const tokenStorage = new AuthNedbStorage({
  dbPath: path.join(process.env.BLOCKLET_DATA_DIR || './', 'auth.db'),
  onload: (err) => {
    dbOnload(err, 'auth.db');
  },
});

const walletHandlers = new WalletHandlers({
  authenticator,
  tokenGenerator: () => Date.now().toString(),
  tokenStorage,
});

module.exports = {
  client,
  wallet,
  walletHandlers,
  tokenStorage,
  service: new BlockletService(),
};
