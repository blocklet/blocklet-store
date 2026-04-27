const { Database } = require('@blocklet/sdk/lib/database');
const { DB_NAME } = require('./constant');

/**
 * Data structure
 * - id: string
 * - blockletDid
 * - appId
 * - appUrl
 * - ownerDid
 * - updatedAt: utc datetime string
 * - createdAt: utc datetime string
 */

class BlockletInstance extends Database {
  constructor() {
    super(DB_NAME.BLOCKLET_INSTANCE);
    this.ensureIndex({ fieldName: 'appId', unique: true }, (err) => {
      if (err) {
        console.error('Failed to ensure appId unique index', err);
      }
    });
  }

  async isAppIdExist(appId) {
    const findItem = await this.findOne({ appId });
    return !!findItem;
  }
}

module.exports = new BlockletInstance();
