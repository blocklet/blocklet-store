const { initModel: initVersionModels } = require('../models/version');
const { initModel: initAccessTokenModels } = require('../models/access-token');
const { initModel: initPricingModels } = require('../models/pricing');
const { initModel: initCategoryModels } = require('../models/category');
const { initModel: initBlockletModels } = require('../models/blocklet');
const { initModel: initDownloadModels } = require('../models/download');
const { initModel: initMeilisearchErrorModels } = require('../models/meilisearch-error');
const { initModel: initMeilisearchSyncFailedModels } = require('../models/meilisearch-sync-failed');

function initModels(sequelize) {
  initVersionModels(sequelize);
  initAccessTokenModels(sequelize);
  initPricingModels(sequelize);
  initCategoryModels(sequelize);
  initBlockletModels(sequelize);
  initDownloadModels(sequelize);
  initMeilisearchErrorModels(sequelize);
  initMeilisearchSyncFailedModels(sequelize);
}

module.exports = {
  initModels,
};
