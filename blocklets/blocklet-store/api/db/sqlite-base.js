const { Op } = require('sequelize');
const logger = require('../libs/logger');
const { DB_NAME } = require('./constant');
const { Blocklet } = require('./models/blocklet');
const { Category } = require('./models/category');
const { Download } = require('./models/download');
const { Pricing } = require('./models/pricing');
const { Version } = require('./models/version');
const { MeilisearchError } = require('./models/meilisearch-error');
const { MeilisearchSyncFailed } = require('./models/meilisearch-sync-failed');
const { AccessToken } = require('./models/access-token');

require('./migration-utils/sequelize');

function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  return Object.getPrototypeOf(obj) === Object.prototype;
}

class SqliteBase {
  constructor(name) {
    this.name = name;
    this.model = null;

    switch (name) {
      case DB_NAME.BLOCKLET:
        this.model = Blocklet;
        break;
      case DB_NAME.BLOCKLET_CATEGORY:
        this.model = Category;
        break;
      case DB_NAME.BLOCKLET_DOWNLOAD:
        this.model = Download;
        break;
      case DB_NAME.BLOCKLET_PRICING:
        this.model = Pricing;
        break;
      case DB_NAME.BLOCKLET_VERSION:
        this.model = Version;
        break;
      case DB_NAME.MEILISEARCH_ERROR:
        this.model = MeilisearchError;
        break;
      case DB_NAME.MEILISEARCH_SYNC_FAILED:
        this.model = MeilisearchSyncFailed;
        break;
      case DB_NAME.ACCESS_TOKEN:
        this.model = AccessToken;
        break;
      default:
        throw new Error(`Invalid name: [${name}]`);
    }
    logger.info('SqliteBase', name);
  }

  ensureIndex() {}

  async exists(...args) {
    const doc = await this.model.findOne({ where: { ...args } });
    return !!doc;
  }

  // convert nedb query to sequelize query
  convertQuery(query = {}) {
    const result = {};
    try {
      // just transfer the plain object, skip class object(eg: where)
      if (!isPlainObject(query)) {
        return query;
      }
      Reflect.ownKeys(query).forEach((key) => {
        const value = query[key];
        const newKey = key === '_id' ? 'id' : key;
        if (typeof value === 'object') {
          if (value instanceof Array) {
            if (key === '$or') {
              const queryList = value.map((x) => this.convertQuery(x, false));
              if (queryList.length > 0) {
                result[Op.or] = queryList;
              }
            } else if (key === '$and') {
              const queryList = value.map((x) => this.convertQuery(x, false));
              if (queryList.length > 0) {
                result[Op.and] = queryList;
              }
            }
          } else if (value === null) {
            result[newKey] = { [Op.is]: null };
          } else if (isPlainObject(value)) {
            let queryList;
            Reflect.ownKeys(value).forEach((valKey) => {
              switch (valKey) {
                case '$or':
                  queryList = value[valKey].map((x) => this.convertQuery(x, false));
                  if (value.length > 0) {
                    result[newKey] = { [Op.or]: queryList };
                  }
                  break;
                case '$and':
                  queryList = value[valKey].map((x) => this.convertQuery(x, false));
                  if (value.length > 0) {
                    result[newKey] = { [Op.and]: queryList };
                  }
                  break;
                case '$in':
                  result[newKey] = { [Op.in]: value[valKey] };
                  break;
                case '$gt':
                  result[newKey] = { [Op.gt]: value[valKey] };
                  break;
                case '$like':
                  result[newKey] = { [Op.like]: value[valKey] };
                  break;
                case '$gte':
                  result[newKey] = { [Op.gte]: value[valKey] };
                  break;
                case '$lt':
                  result[newKey] = { [Op.lt]: value[valKey] };
                  break;
                case '$lte':
                  result[newKey] = { [Op.lte]: value[valKey] };
                  break;
                case '$notIn':
                  result[newKey] = { [Op.notIn]: value[valKey] };
                  break;
                case '$regex':
                  result[newKey] = { [Op.regexp]: value[valKey] };
                  break;
                case '$ne':
                  result[newKey] =
                    value[valKey] === null ? { [Op.ne]: null } : { [Op.or]: { [Op.ne]: value[valKey], [Op.is]: null } };
                  break;
                case '$eq':
                  result[newKey] = { [Op.eq]: value[valKey] };
                  break;
                case '$exists':
                  result[newKey] = value[valKey] ? { [Op.not]: null } : { [Op.is]: null };
                  break;
                default:
                  result[newKey] = value;
              }
            });
          } else {
            result[newKey] = query[key];
          }
        } else if (value !== undefined) {
          result[newKey] = query[key];
        }
      });
    } catch (e) {
      logger.error('convertQuery error:', query);
      throw e;
    }

    return result;
  }

  // convert nedb sort to sequelize sort
  convertSort(sort) {
    const result = [];
    Object.keys(sort).forEach((key) => {
      if (typeof sort[key] === 'number') {
        result.push([key, sort[key] === 1 ? 'ASC' : 'DESC']);
      } else {
        result.push([key, 'ASC']);
      }
    });

    return result;
  }

  // paging search
  async paginate({ condition = {}, sort = {}, page = 1, size = 100, projection = {} }) {
    const offset = Math.max((page - 1) * size, 0);
    const limit = Math.max(size, 1);

    const where = this.convertQuery(condition);
    const order = this.convertSort(sort);
    const { rows, count } = await this.model.findAndCountAll({
      where,
      order,
      offset,
      limit,
      attributes: projection,
    });

    return {
      total: count,
      list: rows.map((x) => ({ ...x.toJSON(), _id: x.id })),
    };
  }

  // paging search total
  async count(query) {
    const where = this.convertQuery(query);
    const count = await this.model.count({ where });
    return count;
  }

  async execQueryAndSort(query, order = { createdAt: -1 }, projection = {}) {
    const docs = await this.model.findAll({
      where: this.convertQuery(query),
      order: this.convertSort(order),
      attributes: projection,
    });
    return docs.map((x) => ({ ...x.toJSON(), _id: x.id }));
  }

  async findOne(query) {
    const data = await this.model.findOne({ where: this.convertQuery(query) });
    return data ? { ...data.toJSON(), _id: data.id } : null;
  }

  async insert(data, { transaction } = {}) {
    if (Array.isArray(data)) {
      const items = await this.model.bulkCreate(
        data.map((x) => (x._id ? { ...x, id: x._id, _id: undefined } : x)),
        {
          transaction,
        }
      );
      return items?.map((x) => ({ ...x.toJSON(), _id: x.id }));
    }
    const item = await this.model.create(data._id ? { ...data, id: data._id, _id: undefined } : data, {
      transaction,
    });

    return item ? { ...item.toJSON(), _id: item.id } : null;
  }

  async find(query) {
    const list = await this.model.findAll({ where: this.convertQuery(query) });
    return list?.map((x) => ({ ...x.toJSON(), _id: x.id }));
  }

  async update(query, data, options = {}) {
    let updateData = data;
    if (data.$set) {
      updateData = data.$set._id ? { ...data.$set, id: data.$set._id, _id: undefined } : data.$set;
    } else if (data._id) {
      updateData = { ...data, id: data._id, _id: undefined };
    }
    const [updateCount] = await this.model.update(updateData, {
      where: this.convertQuery(query),
      transaction: options.transaction,
    });

    if (options.returnUpdatedDocs) {
      const updateRow = await this.model.findOne({ where: this.convertQuery(query) });
      return [updateCount, updateRow ? { ...updateRow.toJSON(), _id: updateRow.id } : null];
    }
    return [updateCount];
  }

  remove(query) {
    return this.model.destroy({ where: this.convertQuery(query) });
  }
}

module.exports = SqliteBase;
