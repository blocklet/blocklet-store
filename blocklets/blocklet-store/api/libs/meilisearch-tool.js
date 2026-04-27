const { omit, pick } = require('lodash-es');
const fs = require('fs');
const path = require('path');

const Blocklet = require('../db/blocklet');
const Version = require('../db/blocklet-version');
const MeilisearchSyncFailed = require('../db/meilisearch-sync-failed');

const MeiliSearchClient = require('./meilisearch');
const { INDEX_NAME } = require('./constant');
const logger = require('./logger');
const env = require('./env');

async function resetMeilisearch() {
  const isIndexExist = await MeiliSearchClient.isIndexExist(INDEX_NAME);
  // 如果已经存在文档索引则先执行请除操作 因为索引中存在文档时不能更改 primaryKey
  if (isIndexExist) {
    await MeiliSearchClient.clear();
  }
  await MeiliSearchClient.init();
}

// 修复 blocklets 数据
async function fixBlocklets(query) {
  const allBlocklets = await Blocklet.getAllBlocklets({});
  const allDidList = allBlocklets.map((b) => b.did);
  const noDidList = allDidList.join(',');
  const { hits } = await MeiliSearchClient.getBlocklets({
    pagination: { page: 1, pageSize: 10000 },
    queryOptions: {
      sort: {},
      filter: {},
      keyword: '',
      sortBy: '',
      sortDirection: '',
    },
    query: { noDidList },
  });

  const missedBlocklets = await Promise.all(
    hits.map(async (item) => {
      const mixedInfo = omit(item, ['_formatted']);
      const rootKeys = [
        'id',
        'did',
        'owner',
        'ownerDid',
        'draftVersion',
        'currentVersion',
        'latestVersion',
        'status',
        'draftMeta',
        'category',
        'lastPublishedAt',
        'stats',
        'meta',
        'permission',
        'draftPaymentShares',
        'paymentShares',
        'source',
        'dependentStores',
        'delegationToken',
        'remark',
        'blockReason',
        'createdAt',
        'updatedAt',
      ];
      const bothKeys = ['description', 'name', 'version', 'category', 'lastPublishedAt', 'stats', 'navigation'];

      const versions = await Version.execQueryAndSort({ did: mixedInfo.did }, { createdAt: -1 });
      const latestVersion = versions[0];
      const currentVersion = versions.find((v) => v.version === mixedInfo.version);
      return {
        draftMeta: null,
        draftPaymentShares: null,
        draftVersion: null,
        remark: '',
        permission: Blocklet.PERMISSIONS.PUBLIC,
        status: Blocklet.STATUS.NORMAL,
        ...omit(pick(mixedInfo, rootKeys), ['owner', 'category', 'nftFactory', 'pricing', 'payment']),
        owner: { did: mixedInfo.owner.did },
        ownerDid: mixedInfo.owner.did,
        category: mixedInfo.category?.id || mixedInfo.category?._id || null,
        latestVersion,
        currentVersion,
        id: mixedInfo.id || mixedInfo._id,
        meta: {
          ...omit(mixedInfo, rootKeys),
          ...pick(mixedInfo, bothKeys),
          category: mixedInfo.category?.id || mixedInfo.category?._id || null,
          did: mixedInfo.did,
        },
      };
    })
  );

  const { dryRun = 'true', didList } = query;

  const excludeDidList = allDidList.concat(didList?.split(',') || []);
  const blocklets = missedBlocklets.filter((item) => !excludeDidList.includes(item.did));

  if (dryRun === 'false' && blocklets.length) {
    const insertedList = [];
    const failedList = [];
    let index = 0;
    while (index < blocklets.length) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const inserted = await Blocklet.insert(blocklets[index]);
        insertedList.push(inserted);
      } catch (error) {
        logger.error('Insert blocklet failed', error);
        failedList.push(blocklets[index]);
        try {
          // eslint-disable-next-line no-await-in-loop
          await MeilisearchSyncFailed.insert(blocklets[index]);
        } catch (e) {
          logger.error('Insert "meilisearch sync failed" failed', e);
        }
      }
      index++;
    }
    return {
      msg: `Inserted ${insertedList.length} blocklets, failed ${failedList.length} blocklets`,
      insertedList,
      failedList,
    };
  }
  if (!blocklets.length) {
    return { msg: 'No blocklets to insert' };
  }
  return {
    totalMissed: blocklets.length,
    summary: blocklets.map((item) => ({
      did: item.did,
      title: item.meta.title,
      author: item.meta.author,
      version: item.meta.version,
    })),
    willInsertList: blocklets,
  };
}

async function syncMeilisearch() {
  const resetMeilisearchFilePath = path.join(env.dataDir, 'reset-meilisearch-log');
  if (fs.existsSync(resetMeilisearchFilePath)) {
    return;
  }
  try {
    const result = await fixBlocklets({ dryRun: 'false' });
    logger.info(result.msg);
  } catch (error) {
    logger.error('Fix blocklets failed', error);
  } finally {
    try {
      await resetMeilisearch();
    } catch (error) {
      logger.error('Reset meilisearch failed', error);
    } finally {
      fs.writeFileSync(resetMeilisearchFilePath, new Date().toISOString());
    }
  }
}

module.exports = {
  resetMeilisearch,
  fixBlocklets,
  syncMeilisearch,
};
