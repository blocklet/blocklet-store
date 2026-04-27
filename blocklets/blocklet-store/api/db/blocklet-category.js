const { literal, where } = require('sequelize');
const { DB_NAME } = require('./constant');
const BaseDB = require('./base');

/**
 * Data structure
 * - id: string
 * - name: string
 * - locales:
 *  - zh: string
 *  - en: string
 * - updatedAt: utc datetime string
 * - createdAt: utc datetime string
 */
class BlockletCategory extends BaseDB {
  constructor() {
    super(DB_NAME.BLOCKLET_CATEGORY);
  }

  async isLocaleExist(localeBy, localeValue) {
    const query = {
      where: where(literal(`json_extract(locales, '$.${localeBy}')`), localeValue),
    };

    const result = await this.findOne(query);
    return !!result;
  }

  async findListById(...idList) {
    const filteredIdList = idList.filter((id) => id);
    if (filteredIdList.length === 0) {
      return [];
    }
    const resList = await this.find({ id: { $in: filteredIdList } });
    const list = idList.map((id) => (id ? resList.find((item) => item.id === id) || null : null));
    return list;
  }
}

module.exports = new BlockletCategory();
