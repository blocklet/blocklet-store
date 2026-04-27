const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const nocache = require('nocache');
const pMap = require('p-map');
const { pick } = require('lodash-es');

const Blocklet = require('../db/blocklet');
const { authenticate, paginate, queryOption } = require('../middlewares');
const { getSatisfiedBlocklets } = require('../libs/blocklet');
const { getBlockletDir } = require('../libs/utils');
const ensureVersion = require('../middlewares/ensure-version');
const { getStoreInfo, queryBlockletsWithMultipleKeywords } = require('../libs/utils');
const blockletVersion = require('../db/blocklet-version');
const blockletDB = require('../db/blocklet');
const { checkUrlQuery, SCHEMA } = require('../libs/schema');

const router = express.Router();

// NOTE: this api is just for test purpose
router.delete('/blocklets/:did', async (req, res) => {
  if (process.env.NODE_ENV !== 'e2e') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const { did } = req.params;
  const result = await Blocklet.remove({ did });
  fs.removeSync(getBlockletDir(did), { recursive: true });
  return res.json({ result, did });
});

router.use('/console', authenticate, require('./admin'));
router.use('/developer', authenticate, require('./developer'));
router.use('/blocklets', require('./blocklet'));
router.use('/blocklet-instances', require('./blocklet-instance'));
router.use('/nft', require('./nft'));
// Deprecated: This method will be removed in the next major release.
router.use('/pricing', authenticate, require('./pricing'));
router.post('/payment/callback', require('./pricing/webhooks'));

// NOTE: This is a compatible endpoint
router.get('/blocklet/:didWithJson(*.json)', (req, res) => {
  const { didWithJson } = req.params;
  const did = path.basename(didWithJson, '.json');
  res.redirect(301, `/api/blocklets/${did}/blocklet.json`);
});

// NOTE: This is a public API 支持分页的新接口
router.get(
  '/v2/blocklets.json',
  nocache(),
  checkUrlQuery({
    sortBy: SCHEMA.meilisearchSortBy(),
    sortDirection: SCHEMA.sortDirection(),
    showResources: SCHEMA.boolean(),
    category: SCHEMA.category(),
    page: SCHEMA.page(),
    pageSize: SCHEMA.pageSize(),
    price: SCHEMA.string().valid('free', 'payment'),
    keyword: SCHEMA.keyword(),
    resourceDid: SCHEMA.did(),
    resourceType: SCHEMA.string(),
    owner: SCHEMA.did(),
    versionCount: SCHEMA.boolean(),
    isOfficial: SCHEMA.boolean(),
  }),
  queryOption,
  paginate,
  ensureVersion,
  async (req, res) => {
    const { serverVersion, storeVersion } = req;
    const results = await queryBlockletsWithMultipleKeywords(req);
    // FIXME: 目前无法在搜索过程中对数据按照 requirements 来分页
    // 只能在查询结果中进行数据的清洗
    results.dataList = await getSatisfiedBlocklets(results.dataList, { serverVersion, storeVersion });

    // 特殊需求，通过参数来额外添加
    // 1. 获取每个 blocklet 的 version 总数
    if (req.query.versionCount === 'true') {
      await pMap(
        results.dataList,
        async (blocklet) => {
          const versionCount = await blockletVersion.count({ did: blocklet.did.toString() });
          blocklet.versionCount = versionCount;
        },
        { concurrency: 1 }
      );
    }

    res.json(results);
  }
);

router.get('/community/analytics', nocache(), queryOption, async (req, res) => {
  const { query } = req;
  const { startDate, endDate, users = [], info = [] } = query;

  // 处理日期格式
  let start;
  let end;
  try {
    start = startDate ? new Date(startDate) : new Date(0);
    end = endDate ? new Date(endDate) : new Date();

    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    start = start.toISOString();
    end = end.toISOString();
  } catch (err) {
    return res.status(400).json({
      error: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)',
    });
  }

  // 获取基本的 blocklet 信息
  const blocklets = await blockletDB.find({
    ...(users.length > 0 ? { ownerDid: { $in: users.map((item) => item.toString()) } } : {}),
    lastPublishedAt: { $ne: null },
    $and: [{ createdAt: { $gte: start } }, { createdAt: { $lte: end } }],
  });

  const userList = {};

  await pMap(
    blocklets,
    async (blocklet) => {
      if (!userList[blocklet.ownerDid]) {
        userList[blocklet.ownerDid] = [];
      }
      userList[blocklet.ownerDid].push({
        did: blocklet.did,
        versionCount: await blockletVersion.count({ did: blocklet.did.toString() }),
        title: blocklet.meta?.title,
        logo: blocklet.meta?.logo,
        createdAt: blocklet.createdAt,
        ...(info.length > 0 ? pick(blocklet, info) : {}),
      });
    },
    { concurrency: 1 }
  );

  return res.json(userList);
});

// FIXME: @zhanghan remove this endpoint in the future, this is a compatible endpoint
router.get('/blocklets.json', (req, res) => {
  res.json([]);
});

router.use('/store.json', (req, res) => {
  res.json(getStoreInfo());
});

router.use((req, res) => {
  res.status(404).json({ error: 'NOT FOUND' });
});

module.exports = router;
