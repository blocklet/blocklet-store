const { DB_NAME } = require('./constant');
const BaseDB = require('./base');

class MeilisearchSyncFailed extends BaseDB {
  constructor() {
    super(DB_NAME.MEILISEARCH_SYNC_FAILED);
  }
}

module.exports = new MeilisearchSyncFailed();
