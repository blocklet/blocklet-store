const { DB_NAME } = require('./constant');
const BaseDB = require('./base');

/**
 * Data structure
 * - id: string
 * - did: string
 * - version: string
 * - uploadedAt: utc datetime string
 * - updatedAt: utc datetime string
 * - createdAt: utc datetime string
 * - publishedAt: utc datetime string
 */

class VersionDB extends BaseDB {
  constructor() {
    super(DB_NAME.BLOCKLET_VERSION);
  }

  async findListById(...idList) {
    const filterIdList = idList.filter((id) => id);
    if (filterIdList.length === 0) {
      return [];
    }
    const resList = await this.find({ id: { $in: filterIdList } });
    const list = idList.map((id) => (id ? resList.find((item) => item.id === id) || null : null));
    return list;
  }
}

module.exports = new VersionDB();
