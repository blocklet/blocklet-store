const BlockletCategory = require('../api/db/blocklet-category');
const logger = require('../api/libs/logger');

async function migration() {
  logger.info('migration@0.10.15 start!!!');
  // 之前给 BlockletCategory 表单独设置了 name 字段做唯一索引，现在新增或者编辑 category 时不再需要 name 字段
  // 需要将 name 索引移除，否则 创建 category 时如果没有 name 字段，将创建失败。
  // see: https://github.com/louischatriot/nedb/issues/217
  await BlockletCategory.removeIndex('name');
  logger.info('migration@0.10.15 success!!!');
}

migration();
