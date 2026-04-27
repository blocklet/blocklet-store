const express = require('express');
const nocache = require('nocache');
const { validateName } = require('@blocklet/meta/lib/name');
const { cloneDeep } = require('lodash-es');
const { isFreeBlocklet } = require('@blocklet/meta/lib/util');
const pMap = require('p-map');
const { where: QueryWhere, literal, Op } = require('sequelize');

const fs = require('fs-extra');
const Blocklet = require('../../db/blocklet');
const { getChainClient, getDraftAssetsDir, getReviewAssetsDir } = require('../../libs/utils');
const { getBlockletMeta } = require('../../libs/blocklet');
const { paginate, ensureDeveloperPassport, queryOption } = require('../../middlewares');
const { event, Events } = require('../../events');
const { VERSION_STATUS, REVIEW_TYPE } = require('../../db/constant');
const blockletVersion = require('../../db/blocklet-version');
const { createReviewBoard, createTopicPost, systemComment } = require('../../libs/comment');
const env = require('../../libs/env');
const logger = require('../../libs/logger');
const { LOCALE_NAME } = require('../../libs/constant');
const { SCHEMA, checkUrlQuery } = require('../../libs/schema');
const { service } = require('../../libs/auth');

const router = express.Router();

// 检查 blocklet 名称是否重复
router.get('/isNameExist', checkUrlQuery({ name: SCHEMA.string(true) }), async (req, res) => {
  const { name } = req.query;
  const result = await Blocklet.isNameExist(name);
  res.json({ result });
});

// ---------------- 开发者和管理员身份的开发者都能操作的 ------------------
// 获取 blocklet 列表
router.get(
  '',
  ensureDeveloperPassport,
  nocache(),
  checkUrlQuery({
    page: SCHEMA.page(),
    pageSize: SCHEMA.pageSize(),
    sortBy: SCHEMA.sortBy(),
    sortDirection: SCHEMA.sortDirection(),
    keyword: SCHEMA.keyword(),
    showResources: SCHEMA.showResources(),
    allBlockletCount: SCHEMA.allBlockletCount(),
  }),
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

    let resourceIds = [];
    const countParams = {};
    if (orgId) {
      try {
        const { data = [] } = await service.getOrgResource({ orgId });
        resourceIds = data.map((item) => item.resourceId);
        filter.id = resourceIds.length > 0 ? resourceIds : [''];
        countParams.id = { [Op.in]: resourceIds };
      } catch (error) {
        logger.error('Get org resource failed', { error, orgId });
      }
    }
    /**
     * 模糊搜索： did、name、title、remark
     * filter： 状态、权限
     * sort： createdAt 、stats.downloads
     */
    filter.owner = [did];
    let totalBlocklet;
    if (query.allBlockletCount) {
      totalBlocklet = await Blocklet.count({
        $and: [
          QueryWhere(literal('json_extract(latestVersion, "$.id")'), { [Op.ne]: null }),
          { ownerDid: did },
          countParams,
        ],
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

// 更新自己的 blocklet 信息
router.put(
  '/:id',
  checkUrlQuery(
    {
      remark: SCHEMA.string().max(1000).allow(null),
      permission: SCHEMA.permission(),
    },
    'body'
  ),
  ensureDeveloperPassport,
  async (req, res) => {
    const locale = req.cookies[LOCALE_NAME];
    const { id } = req.params;
    const { remark, permission } = req.body;
    const { did } = req.user;
    if (!(await Blocklet.isOwner(did, id))) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    const result = await Blocklet.update({ _id: id }, { $set: { remark, permission } });

    event.emit(Events.BLOCKLET_PERMISSION_CHANGED, {
      blockletId: id,
      permission,
      locale,
    });

    return res.json(result);
  }
);

// 更新 review status
router.put(
  '/:did/request-review',
  checkUrlQuery(
    {
      version: SCHEMA.version(),
      url: SCHEMA.url(),
    },
    'body'
  ),
  ensureDeveloperPassport,
  async (req, res) => {
    const locale = req.cookies[LOCALE_NAME];
    const { did } = req.params;
    const { version, url } = req.body;
    const { did: userDid } = req.user;
    const blocklet = await Blocklet.findOne({ did });
    if (!blocklet) {
      return res.status(404).json({ error: 'Blocklet not found' });
    }

    const { reviewVersion, latestVersion, ownerDid } = blocklet;

    if (ownerDid !== userDid) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    if (
      reviewVersion?.version === version ||
      (latestVersion?.version === version && latestVersion.status !== VERSION_STATUS.DRAFT)
    ) {
      return res.status(400).json({ error: 'Version already in review' });
    }

    // 移动 draft 目录到 review 目录
    // 删除 review 目录，将 draft 目录重命名为 review
    const draftStatic = getDraftAssetsDir(did);
    if (!fs.existsSync(draftStatic)) {
      return res.status(404).json({ error: `Move draft blocklet static files failed: ${draftStatic} not found` });
    }
    try {
      const reviewStatic = getReviewAssetsDir(did);
      if (fs.existsSync(reviewStatic)) {
        fs.removeSync(reviewStatic);
      }
      fs.renameSync(draftStatic, reviewStatic);
    } catch (error) {
      logger.error('move draft blocklet static files failed', error, req.originalUrl, 500, req.headers['x-real-ip']);
      return res.status(500).json({ error: `Move draft blocklet static files failed: ${error.message}` });
    }

    // 将其它 待审核 与 审核中 版本状态更新为 CANCELLED
    const versions = await blockletVersion.find({
      did,
      status: { $in: [VERSION_STATUS.PENDING_REVIEW, VERSION_STATUS.IN_REVIEW] },
    });
    if (versions.length > 0) {
      let count = 0;
      while (count < versions.length) {
        const cancelVersion = versions[count];
        // eslint-disable-next-line no-await-in-loop
        await blockletVersion.update(
          { did, version: cancelVersion.version },
          {
            status: VERSION_STATUS.CANCELLED,
            deleted: true,
            canceledAt: new Date().toISOString(),
            note: `Canceled by ${version}`,
          }
        );
        // eslint-disable-next-line no-await-in-loop
        await systemComment({
          reviewId: cancelVersion.id,
          text: `✖️ Canceled by ${version} request review!`,
          color: '#9b9b9b',
        });

        count++;
      }
    }

    // 设置 当前版本 为 待审核
    await blockletVersion.update(
      { did, version },
      {
        pendingAt: new Date().toISOString(),
        status: VERSION_STATUS.PENDING_REVIEW,
      }
    );
    // 将审核中的版本设置为 当前版本
    const newVersion = await blockletVersion.findOne({ did, version });
    await Blocklet.update(
      { did },
      {
        $set: {
          reviewVersion: newVersion,
          ...(version === blocklet.latestVersion.version ? { latestVersion: newVersion } : {}),
        },
      }
    );

    // 创建审核板块
    await createReviewBoard(did, version);
    await createTopicPost({
      url,
      reviewId: newVersion.id,
      title: blocklet.meta.title || blocklet.meta.name,
      version,
      blockletOwnerDid: blocklet.ownerDid,
    });

    await systemComment({ reviewId: newVersion.id, text: '🚧 Pending Review!', color: '#f5a623' });
    event.emit(Events.BLOCKLET_REVIEWED, { blockletId: blocklet.id, locale, action: VERSION_STATUS.PENDING_REVIEW });
    return res.json({ message: 'success' });
  }
);

// 取消审核
router.put(
  '/:did/cancel-review',
  checkUrlQuery(
    {
      version: SCHEMA.version(true),
    },
    'body'
  ),
  ensureDeveloperPassport,
  async (req, res) => {
    const locale = req.cookies[LOCALE_NAME];
    const { did } = req.params;
    const { version } = req.body;
    const { did: userDid } = req.user;
    const blocklet = await Blocklet.findOne({ did });

    if (!blocklet) {
      return res.status(404).json({ error: 'Blocklet not found' });
    }

    if (blocklet.ownerDid !== userDid) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { reviewVersion } = blocklet;

    if (
      !reviewVersion?.status ||
      reviewVersion.version !== version ||
      ![VERSION_STATUS.PENDING_REVIEW, VERSION_STATUS.IN_REVIEW, VERSION_STATUS.APPROVED].includes(reviewVersion.status)
    ) {
      return res.status(404).json({ error: `This version ${version} does not support modifying status` });
    }

    if (reviewVersion.status === VERSION_STATUS.CANCELLED) {
      return res.status(400).json({ error: `This version ${version} has been cancelled` });
    }

    await blockletVersion.update(
      { did, version },
      {
        status: VERSION_STATUS.CANCELLED,
        deleted: true,
        canceledAt: new Date().toISOString(),
        note: 'Canceled by user',
      }
    );

    // 将审核中的版本设置为 当前版本
    const newVersion = await blockletVersion.findOne({ did, version });
    await Blocklet.update(
      { did },
      {
        $set: {
          reviewVersion: newVersion,
          ...(version === blocklet.latestVersion.version ? { latestVersion: newVersion } : {}),
        },
      }
    );

    if (blocklet.reviewVersion?.id) {
      await systemComment({
        reviewId: blocklet.reviewVersion.id,
        text: '✖️ Canceled by user!',
        color: '#9b9b9b',
      });
    }

    event.emit(Events.BLOCKLET_REVIEWED, { blockletId: blocklet.id, locale, action: VERSION_STATUS.CANCELLED });
    return res.json({ message: 'success' });
  }
);

// 创建自己的 blocklet
router.post(
  '',
  checkUrlQuery(
    {
      name: SCHEMA.string(true).max(32),
      remark: SCHEMA.string().max(1000).allow(null),
      permission: SCHEMA.permission(),
      did: SCHEMA.did(true),
    },
    'body'
  ),
  ensureDeveloperPassport,
  async (req, res) => {
    const locale = req.cookies[LOCALE_NAME];
    const { did: userDid } = req.user;
    const { name, remark, permission, did } = req.body;
    try {
      validateName(name);
    } catch (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (await Blocklet.isNameExist(name)) {
      res.status(400).json({ error: 'blocklet name is exist' });
      return;
    }
    const blocklet = await Blocklet.insert({
      did,
      remark,
      meta: {
        name,
      },
      permission,
      owner: { did: userDid },
      ownerDid: userDid,
      currentVersion: null,
      draftVersion: null,
      latestVersion: null,
      status: Blocklet.STATUS.NORMAL,
      source: Blocklet.SOURCE.WEBSITE,
    });

    event.emit(Events.BLOCKLET_CREATED, {
      blockletDid: did,
      locale,
    });

    res.json(blocklet);
  }
);

// 检查是否是付费情况
// 发布前要校验 是否付费应用 isFreeBlocklet 方法
// 如果是，再检查 nft-factory 是否在链上存在,getFactoryState 方法
// 如果不存在，需要用户扫码签名交易之后，创建 nft-factory，再 publish，
// 返回动态生成 action
router.get('/verify-nft-factory/:did', ensureDeveloperPassport, nocache(), async (req, res) => {
  const { did } = req.params;
  const freeBlocklet = 'free-publish-blocklet';
  const paymentBlocklet = 'paid-publish-blocklet';

  const blocklet = await Blocklet.findOne({ did });
  if (!blocklet) {
    res.status(404).json({ error: 'NOT FOUND' });
    return;
  }

  const canPublish =
    !env.preferences.needReview ||
    blocklet.reviewVersion?.status === VERSION_STATUS.APPROVED ||
    (blocklet.reviewType === REVIEW_TYPE.FIRST && !!blocklet.currentVersion);

  if (!canPublish) {
    res.status(404).json({ error: `the blocklet [${blocklet.did.toString()}] is need review` });
    return;
  }

  const versionInfo = blocklet.reviewVersion || blocklet.latestVersion;
  const meta = cloneDeep(await getBlockletMeta(did, versionInfo.version));
  if (isFreeBlocklet(meta)) {
    res.json(freeBlocklet);
    return;
  }

  if (!meta.nftFactory) {
    res.status(400).json({ error: 'Missing NFT factory for paid blocklet' });
    return;
  }

  // ensure factory exists on chain
  // eslint-disable-next-line no-unreachable
  const client = getChainClient();
  try {
    const { state } = await client.getFactoryState({ address: meta.nftFactory });
    if (!state) {
      // 调用钱包创建 nft-factory
      res.json(paymentBlocklet);
      return;
    }
    // 不创建 nft-factory 直接发布
    res.json(freeBlocklet);
  } catch (err) {
    logger.error(err, req.originalUrl, 500, req.headers['x-real-ip']);
    res.status(500).json({ error: err.message });
  }
});

// 删除某一类型的delegationToken
router.delete('/:id/delegation/:key', async (req, res) => {
  const { key } = req.params;
  const { did: userDid } = req.user;
  const { did } = req.body;
  const locale = req.cookies[LOCALE_NAME];

  const blocklet = await Blocklet.findOne({ did });

  if (blocklet?.owner.did !== userDid) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const delegationToken = blocklet?.delegationToken ? blocklet.delegationToken : {};
  delete delegationToken[key];
  const result = await Blocklet.update(
    { did },
    { $set: { delegationToken: Object.keys(delegationToken).length > 0 ? delegationToken : null } }
  );

  event.emit(Events.BLOCKLET_DISABLED_AUTO_PUBLISH, {
    blockletDid: did,
    locale,
  });

  return res.json(result);
});

module.exports = router;
