const express = require('express');
const nocache = require('nocache');
const pMap = require('p-map');
const { where: QueryWhere, literal, Op } = require('sequelize');

const Blocklet = require('../../db/blocklet');
const BlockletCategory = require('../../db/blocklet-category');
const { event, Events } = require('../../events');
const { authAdmin, paginate, queryOption } = require('../../middlewares');
const MeiliSearchClient = require('../../libs/meilisearch');
const logger = require('../../libs/logger');
const { slashOnBlock } = require('../../crons/revoke-stake');
const { resetMeilisearch, fixBlocklets } = require('../../libs/meilisearch-tool');
const meilisearchSyncFailed = require('../../db/meilisearch-sync-failed');
const { getBlockletMeta } = require('../../libs/blocklet');
const { VERSION_STATUS } = require('../../db/constant');
const { startReview, approveReview, rejectReview } = require('../../libs/review');
const { autoPublish } = require('../upload');
const { LOCALE_NAME } = require('../../libs/constant');
const { checkUrlQuery, SCHEMA } = require('../../libs/schema');
const { service } = require('../../libs/auth');

const router = express.Router();
// ---------------- 管理员身份的开发者可操作的 ------------------
// 获取 blocklet 列表
router.get(
  '',
  authAdmin,
  checkUrlQuery({
    page: SCHEMA.page(),
    pageSize: SCHEMA.pageSize(),
    sortBy: SCHEMA.sortBy(),
    sortDirection: SCHEMA.sortDirection(),
    keyword: SCHEMA.keyword(),
    showResources: SCHEMA.showResources(),
    allBlockletCount: SCHEMA.allBlockletCount(),
  }),
  nocache(),
  paginate,
  queryOption,
  async (req, res) => {
    const { pagination, queryOption: queryOptions, query } = req;
    const { did, org: orgId = '' } = req.user;
    const { sort, filter = {} } = queryOptions;
    const params = { pagination, queryOptions, query };
    // 如果指定的 sort 不是 createdAt，则将 createdAt 设置为第二排序规则
    if (!sort.createdAt) {
      sort.createdAt = Object.values(sort)?.[0] || -1;
    }

    /**
     * 模糊搜索： did、name 、title、remark
     * filter： 状态、权限
     * sort： createdAt 、stats.downloads
     */
    let resourceIds = [];
    let countParams = [];
    if (orgId) {
      try {
        const { data = [] } = await service.getOrgResource({ orgId });
        resourceIds = data.map((item) => item.resourceId);
        filter.id = resourceIds.length > 0 ? resourceIds : [''];
        countParams = [{ id: { [Op.in]: resourceIds } }, { ownerDid: did }];
      } catch (error) {
        logger.error('Get org resource failed', { error, orgId });
      }
    }

    let totalBlocklet;
    if (query.allBlockletCount) {
      totalBlocklet = await Blocklet.count({
        $and: [QueryWhere(literal('json_extract(latestVersion, "$.id")'), { [Op.ne]: null }), ...countParams],
      });
    }

    const result = await Blocklet.getBlockletList({ params }).then(async ({ dataList, ...rest }) => {
      const blocklets = [];
      await pMap(
        dataList,
        async (blocklet) => {
          let meta;
          if (blocklet.latestVersion.version === blocklet.currentVersion?.version && blocklet.meta) {
            meta = blocklet.meta;
          } else {
            meta = await getBlockletMeta(blocklet.did, blocklet.latestVersion?.version);
          }
          blocklets.push({
            ...blocklet,
            meta: Blocklet.attachBlockletStats(blocklet, {
              ...blocklet.draftMeta,
              ...blocklet.meta,
              did: meta?.did || blocklet.did,
              ...meta,
            }),
            inOrg: resourceIds.includes(blocklet.id),
          });
        },
        { concurrency: 1 }
      );
      return { dataList: blocklets, ...rest, totalBlocklet };
    });
    res.json(result);
  }
);

router.put('/:id/block', authAdmin, async (req, res) => {
  const locale = req.cookies[LOCALE_NAME];
  const { id } = req.params;
  const { blockReason = '', slashStaking = false } = req.body;

  logger.info('blocklet blocked attempt', { id, by: req.user.did, reason: blockReason }, req.body);

  if (blockReason.length > 255) {
    res.status(400).json({ error: 'Block reason length should not exceed 255' });
  }

  // FIXME: @wangshijun put this into a queue
  if (slashStaking) {
    await slashOnBlock(id);
  }

  const result = await Blocklet.update(
    { id },
    {
      $set: {
        status: Blocklet.STATUS.BLOCKED,
        blockReason,
      },
    }
  );

  event.emit(Events.BLOCKLET_BLOCKED, {
    blockletId: id,
    locale,
  });

  res.json(result);
});

router.put(
  '/:did/review',
  authAdmin,
  checkUrlQuery(
    {
      version: SCHEMA.version(),
      action: SCHEMA.string().valid(VERSION_STATUS.IN_REVIEW, VERSION_STATUS.APPROVED, VERSION_STATUS.REJECTED),
      reviewType: SCHEMA.reviewType(),
      category: SCHEMA.string(),
    },
    'body'
  ),
  async (req, res) => {
    const locale = req.cookies[LOCALE_NAME];
    const { did } = req.params;
    const { version, action, reviewType, category: categoryId } = req.body;
    const blocklet = await Blocklet.findOne({ did });

    if (!blocklet) {
      res.status(404).json({ error: 'Blocklet not found' });
      return;
    }

    if (blocklet.reviewVersion?.version !== version) {
      res.status(400).json({ error: 'Review version not found' });
      return;
    }

    if (![VERSION_STATUS.IN_REVIEW, VERSION_STATUS.APPROVED, VERSION_STATUS.REJECTED].includes(action)) {
      res.status(400).json({ error: 'Invalid review action' });
      return;
    }

    let result;
    if (action === VERSION_STATUS.IN_REVIEW) {
      result = await startReview({ blocklet, version, operator: req.user.did });
    } else if (action === VERSION_STATUS.APPROVED) {
      result = await approveReview({ blocklet, version, categoryId, reviewType, operator: req.user.did });
    } else if (action === VERSION_STATUS.REJECTED) {
      result = await rejectReview({ blocklet, version, operator: req.user.did });
    }
    if (result.error) {
      res.status(result.code).json({ error: result.error });
    } else {
      event.emit(Events.BLOCKLET_REVIEWED, {
        blockletId: blocklet.id,
        action,
        locale,
      });

      if (action === VERSION_STATUS.APPROVED) {
        req.blocklet = blocklet;
        req.meta = await getBlockletMeta(blocklet.did, version, true);
        await autoPublish(req, res, VERSION_STATUS.APPROVED);
      }
      res.status(result.code).json({ status: result.status });
    }
  }
);

router.put('/:id/unblock', authAdmin, checkUrlQuery({ locale: SCHEMA.locale() }, 'body'), async (req, res) => {
  const { id } = req.params;
  const { locale = 'en' } = req.body;
  const result = await Blocklet.update(
    { id },
    {
      $set: {
        status: Blocklet.STATUS.NORMAL,
        blockReason: null,
      },
    }
  );

  event.emit(Events.BLOCKLET_UNBLOCKED, {
    blockletId: id,
    locale,
  });

  res.json(result);
});

router.put(
  '/:id/category',
  authAdmin,
  checkUrlQuery(
    {
      category: SCHEMA.string(true),
      reviewType: SCHEMA.reviewType(),
    },
    'body'
  ),
  async (req, res) => {
    const locale = req.cookies[LOCALE_NAME];
    const { id } = req.params;
    const { category: categoryId, reviewType } = req.body;
    // 检查 category 是否存在, 不存在时拒绝客户端请求
    const category = await BlockletCategory.findOne({ id: categoryId });
    if (!category) {
      res.status(400).json({ error: 'The category is not exist' });
      return;
    }

    await Blocklet.update(
      { id },
      {
        $set: {
          category: categoryId,
          ...(reviewType ? { reviewType } : {}),
        },
      }
    );

    event.emit(Events.BLOCKLET_CATEGORY_CHANGED, {
      blockletId: id,
      doc: { category, ...(reviewType ? { reviewType } : {}) },
      locale,
    });

    res.json('update success');
  }
);

// ---- start 留给管理员维护 meilisearch 的接口 ----
router.put('/reset_meilisearch', authAdmin, async (_req, res) => {
  await resetMeilisearch();
  res.json('init meilisearch success');
});

// 获取 meilisearch 的 api key
router.get('/meilisearch_keys', authAdmin, async (_req, res) => {
  const result = await MeiliSearchClient.getKeys();
  res.json(result);
});

// 获取 meilisearch 的 api key
router.get('/meilisearch_sync_failed', authAdmin, async (_req, res) => {
  const result = await meilisearchSyncFailed.find();
  res.json(result);
});

// 修复 blocklets 数据
router.put('/fix_blocklets', authAdmin, async (req, res) => {
  const result = await fixBlocklets(req.query);
  res.json(result);
});

router.get('/meilisearch_query', authAdmin, async (req, res) => {
  const { owner, category, resourceDid, sort, sortDirection, page = 1, pageSize = 50, ...query } = req.query;
  const { hits, estimatedTotalHits } = await MeiliSearchClient.getBlocklets({
    query: { ...query, owner, category, resourceDid },
    queryOptions: { sortBy: sort, sortDirection },
    pagination: { page: Number(page), pageSize: Number(pageSize) },
  });
  res.json({
    total: estimatedTotalHits,
    summary: hits.map((item) => ({ did: item.did, title: item.title, owner: item.owner, author: item.author })),
    hits,
  });
});

// ---- end ----
module.exports = router;
