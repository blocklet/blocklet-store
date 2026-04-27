const { Database } = require('@blocklet/sdk/lib/database');

class BaseDB extends Database {
  constructor(name) {
    super(name);
    this.name = name;
  }

  async exists(...args) {
    const doc = await this.findOne(...args);
    return !!doc;
  }

  async paginate({ condition = {}, sort = {}, page = 0, size = 100, projection = {} }) {
    const result = await this.cursor(condition)
      .sort(sort)
      .skip(Math.max(page * size - size, 0))
      .limit(Math.max(size, 1))
      .projection(projection)
      .exec();

    const total = await this.count(condition);
    return { list: result, total };
  }

  execQueryAndSort(query, sort = { createdAt: -1 }, projection = {}) {
    return this.cursor(query).projection(projection).sort(sort).exec();
  }
}

/**
 * Rename _id field name to id, this method has side effects
 * @param {object} entities
 */
BaseDB.renameIdFiledName = (entities, from = '_id', to = 'id') => {
  /* eslint-disable  no-underscore-dangle, no-param-reassign */

  if (!entities) {
    return entities;
  }

  const mapEntity = (entity) => {
    if (entity[from]) {
      entity[to] = entity[from];
      delete entity[from];
    }
  };

  if (!Array.isArray(entities)) {
    mapEntity(entities);
    return entities;
  }

  entities.forEach(mapEntity);

  return entities;
};

module.exports = BaseDB;
