const logger = require('../api/libs/logger');
const MeiliSearchClient = require('../api/libs/meilisearch');
const { INDEX_NAME } = require('../api/libs/constant');

async function migration() {
  logger.info('migration@0.9.5 start!!!');
  // 检测 ms 是否启动
  await MeiliSearchClient.waitForMeilisearch();
  logger.info('meilisearch is running');
  const isIndexExist = await MeiliSearchClient.isIndexExist(INDEX_NAME);
  // 如果已经存在文档索引则先执行请除操作 因为索引中存在文档时不能更改 primaryKey
  if (isIndexExist) {
    await MeiliSearchClient.clear();
  }
  await MeiliSearchClient.init();
  logger.info('migration@0.9.5 success!!!');
}

migration();
