const { DB_NAME } = require('./constant');
const BaseDB = require('./base');

/**
 * Data structure
 * - id: string
 * - blockletId: string
 * - message: string
 * - action: string
 * - updatedAt: utc datetime string
 * - createdAt: utc datetime string
 */

class MeilisearchError extends BaseDB {
  constructor() {
    super(DB_NAME.MEILISEARCH_ERROR);
  }
}

module.exports = new MeilisearchError();
