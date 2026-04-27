const { Version } = require('../models/version');
const { Category } = require('../models/category');
const { Download } = require('../models/download');
const { Pricing } = require('../models/pricing');
const { AccessToken } = require('../models/access-token');
const { MeilisearchError } = require('../models/meilisearch-error');
const { Blocklet } = require('../models/blocklet');

const logger = require('../../libs/logger');
const { migrationData } = require('../migration-utils/tool');
const { DB_NAME } = require('../constant');

async function up({ sequelize }) {
  logger.info('start 2024-11-19-up');

  // migrate to sqlite and recreate all tables
  await sequelize.sync({ force: true });

  // migrate user data
  await migrationData(DB_NAME.BLOCKLET_VERSION, Version, 2000);
  await migrationData(DB_NAME.BLOCKLET_CATEGORY, Category);
  await migrationData(DB_NAME.BLOCKLET_PRICING, Pricing);
  await migrationData(DB_NAME.ACCESS_TOKEN, AccessToken);
  await migrationData(DB_NAME.MEILISEARCH_ERROR, MeilisearchError);
  await migrationData(DB_NAME.BLOCKLET, Blocklet, 500, (doc) => ({
    ...doc,
    ownerDid: doc.owner.did,
    currentVersion: doc.currentVersion ? { ...doc.currentVersion, id: doc.currentVersion._id, _id: undefined } : null,
    latestVersion: doc.latestVersion ? { ...doc.latestVersion, id: doc.latestVersion._id, _id: undefined } : null,
    draftVersion: doc.draftVersion ? { ...doc.draftVersion, id: doc.draftVersion._id, _id: undefined } : null,
  }));
  await migrationData(DB_NAME.BLOCKLET_DOWNLOAD, Download, 2000);
  logger.info('end 2024-11-19-up');
}

function down() {
  logger.info('2024-11-19-down');
}

module.exports = {
  up,
  down,
};
