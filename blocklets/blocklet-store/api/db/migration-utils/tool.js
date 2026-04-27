const logger = require('../../libs/logger');
const NedbBase = require('../nedb-base');

const OFFSET_LOG_TIME = 1000 * 5;
// migrate data from nedb to sqlite
async function migrationData(dbName, sqliteModel, pageSize = 200, convertItemData = null) {
  const nedbModel = new NedbBase(dbName);
  // Paged query of nedb data, 100 items per page, batch insert into sqlite until all data migration is complete
  let page = 1;
  let logTime = Date.now();
  const total = await nedbModel.count({});
  let totalPages = Math.ceil(total / pageSize);
  logger.info(`Start migrating ${total} [${dbName}] data to sqlite...`);
  const ids = new Set();
  while (page <= totalPages) {
    // eslint-disable-next-line no-await-in-loop
    const { list: docs } = await nedbModel.paginate({
      condition: {},
      sort: { createdAt: 1 },
      page,
      size: pageSize,
    });
    const items = docs
      .filter((doc) => {
        const docId = doc._id || doc.id;
        if (ids.has(docId)) {
          return false;
        }
        ids.add(docId);
        return true;
      })
      .map((doc) => {
        const newDoc = { ...(convertItemData ? convertItemData(doc) : doc), id: doc._id };
        delete newDoc._id;
        return newDoc;
      });

    // eslint-disable-next-line no-await-in-loop
    await sqliteModel.bulkCreate(items, { transaction: null });
    const currentTime = Date.now();
    if (currentTime - logTime > OFFSET_LOG_TIME) {
      logTime = currentTime;
      logger.info(`Migrated ${Math.floor((page / totalPages) * 100)}% [${dbName}] data to sqlite`);
    }
    page += 1;
  }
  logger.info(`Migrated 100% [${dbName}] data to sqlite`);

  // query if the data in sqlite matches the data in nedb
  const nedbTotal = await nedbModel.count({});
  const sqliteTotal = await sqliteModel.count({});
  if (nedbTotal !== sqliteTotal) {
    throw new Error(`Migrate [${dbName}] data to sqlite failed, nedbTotal: ${nedbTotal}, sqliteTotal: ${sqliteTotal}`);
  }

  // query 100 pieces of data at a time and compare the data for consistency
  const queryPageSize = 2000;
  totalPages = Math.ceil(total / queryPageSize);
  page = 1;
  while (page <= totalPages) {
    // eslint-disable-next-line no-await-in-loop
    const { list: nedbDocs } = await nedbModel.paginate({
      condition: {},
      sort: { createdAt: 1 },
      page,
      size: queryPageSize,
    });
    // eslint-disable-next-line no-await-in-loop
    const sqliteDocs = await sqliteModel.findAll({
      order: [['createdAt', 'ASC']],
      offset: (page - 1) * queryPageSize,
      limit: queryPageSize,
    });
    for (let i = 0; i < nedbDocs.length; i++) {
      const nedbDoc = nedbDocs[i];
      const sqliteDoc = sqliteDocs[i];
      if (!deepEqual(nedbDoc, sqliteDoc.toJSON())) {
        logger.warn(
          `Migrate [${dbName}] data to sqlite failed, "nedbDoc": ${nedbDoc._id}, "sqliteDoc": ${sqliteDoc.id}`
        );
        logger.info('');
        throw new Error();
      }
    }
    const currentTime = Date.now();
    if (currentTime - logTime > OFFSET_LOG_TIME) {
      logTime = currentTime;
      logger.info(`Check [${dbName}] data consistency, checked ${Math.floor((page / totalPages) * 100)}%`);
    }
    page += 1;
  }

  logger.info(`Check [${dbName}] data consistency, checked 100%`);
  logger.info(`Migrate ${total} [${dbName}] data to sqlite done`);
  logger.info('');
}

// deep compare two objects
function deepEqual(nedbObj, sqliteObj) {
  const nedbKeys = Object.keys(nedbObj);

  // eslint-disable-next-line no-restricted-syntax
  for (const key of nedbKeys) {
    const sqliteKey = key === '_id' ? 'id' : key;
    if (Object.prototype.hasOwnProperty.call(sqliteObj, sqliteKey)) {
      if (Array.isArray(nedbObj[key]) && Array.isArray(sqliteObj[sqliteKey])) {
        // if the property value is an array
        if (nedbObj[key].length !== sqliteObj[sqliteKey].length) {
          logger.warn(
            `failed: array length not equal: ${key}, nedbObj: ${nedbObj[key].length}, sqliteObj: ${sqliteObj[sqliteKey].length}`
          );
          return false;
        }
        for (let i = 0; i < nedbObj[key].length; i++) {
          if (typeof nedbObj[key] === 'object' && nedbObj[key] !== null && sqliteObj[sqliteKey] !== null) {
            if (!deepEqual(nedbObj[key][i], sqliteObj[sqliteKey][i])) {
              // Recursively compare each element of an array
              logger.warn(`failed: array element not equal: ${key} index: ${i}`);
              logger.warn(`  nedbObj: ${JSON.stringify(nedbObj[key][i])}`);
              logger.warn(`sqliteObj: ${JSON.stringify(sqliteObj[sqliteKey][i])}`);
              return false;
            }
          } else if (nedbObj[key][i] !== sqliteObj[sqliteKey][i]) {
            logger.warn(`failed: array element not equal: ${key} index: ${i}`);
            logger.warn(`  nedbObj: ${nedbObj[key][i]}`);
            logger.warn(`sqliteObj: ${sqliteObj[sqliteKey][i]}`);
            return false;
          }
        }
      } else if (typeof nedbObj[key] === 'object' && nedbObj[key] !== null && sqliteObj[sqliteKey] !== null) {
        if (!deepEqual(nedbObj[key], sqliteObj[sqliteKey])) {
          logger.warn(`failed: object not equal: ${key}`);
          logger.warn(`  nedbObj: ${JSON.stringify(nedbObj[key])}`);
          logger.warn(`sqliteObj: ${JSON.stringify(sqliteObj[sqliteKey])}`);
          return false;
        }
      } else if (
        (typeof nedbObj[key] === 'string' || typeof nedbObj[key] === 'number') &&
        typeof sqliteObj[sqliteKey] === 'object'
      ) {
        // date prop in sqlite is object, but in nedb is string
        if (
          sqliteObj[sqliteKey] !== null &&
          new Date(nedbObj[key]).getTime() !== new Date(sqliteObj[sqliteKey]).getTime()
        ) {
          logger.warn(`failed: date not equal: ${key}`);
          logger.warn(`  nedbObj: ${nedbObj[key]}`);
          logger.warn(`sqliteObj: ${sqliteObj[sqliteKey]}`);
          return false;
        }
      } else if (nedbObj[key] !== sqliteObj[sqliteKey]) {
        logger.warn(`failed: value not equal: ${key}`);
        logger.warn(`  nedbObj: ${nedbObj[key]}`);
        logger.warn(`sqliteObj: ${sqliteObj[sqliteKey]}`);
        return false;
      }
    } else {
      // check for the attribute nedbObj that exists in sqliteObj
      const sqliteKeys = Object.keys(sqliteObj);
      logger.info('');
      logger.error(
        'failed: the "sqliteObj" is missing the attribute of "nedbObj", Please ensure the "sqliteObj" has the following keys:'
      );
      logger.error(
        `missing [ key | value ] : [${nedbKeys
          .filter((fieldKey) => !sqliteKeys.includes(fieldKey))
          .map(
            (fieldKey) => `[${fieldKey} | ${typeof nedbObj[fieldKey] === 'object' ? 'Json' : `"${nedbObj[fieldKey]}"`}]`
          )
          .join(', ')}]`
      );
      logger.info('');
      return false;
    }
  }

  return true;
}

async function hasColumn(tableName, columnName) {
  const columnsDescription = await context.describeTable(tableName);
  return columnName in columnsDescription;
}

module.exports = { migrationData, hasColumn };
