const express = require('express');
const nocache = require('nocache');
const slugify = require('slugify');
const semver = require('semver');
const { pick, omit } = require('lodash-es');
const ISO6391 = require('iso-639-1');
const { joinURL, withQuery } = require('ufo');
const { BN, fromUnitToToken, fromTokenToUnit } = require('@ocap/util');
const { isFreeBlocklet } = require('@blocklet/meta/lib/util');
const { verifyDownloadToken } = require('@blocklet/util');
const { parseBlocklet } = require('@blocklet/resolver');
const { LRUCache } = require('lru-cache');
const { Op } = require('sequelize');

const Blocklet = require('../db/blocklet');
const BlockletCategory = require('../db/blocklet-category');
const BlockletDownload = require('../db/blocklet-download');
const BlockletInstance = require('../db/blocklet-instance');
const { getBlockletTarballFilepath, getBlockletMeta, getReadmeMap, getSatisfiedVersion } = require('../libs/blocklet');
const logger = require('../libs/logger');
const BlockletVersion = require('../db/blocklet-version');
const { client, wallet, service } = require('../libs/auth');
const { paginate, queryOption, ensureUser, authenticate } = require('../middlewares');
const { parseGitUrl } = require('../libs/utils');
const { event, Events } = require('../events');
const ensureVersion = require('../middlewares/ensure-version');
const { ASSETS_PATH_PREFIX } = require('../libs/constant');
const blockletPricing = require('../db/blocklet-pricing');
const { createNftFactoryItx } = require('../libs/nft/blocklet-nft/create-factory');
const { queryBlocklets } = require('../libs/utils');
const blockletVersion = require('../db/blocklet-version');
const { VERSION_STATUS } = require('../db/constant');
const { publishComment } = require('../libs/comment');
const { router: uploadRouter } = require('./upload');
const env = require('../libs/env');
const { checkUrlQuery, SCHEMA } = require('../libs/schema');

const router = express.Router();
router.use('/upload', uploadRouter);

const responseBlockletJson = async (req, res) => {
  const { did, version, blocklet, serverVersion, storeVersion } = req;
  const satisfiedVersion = await getSatisfiedVersion(did, version, {
    meta: blocklet.meta,
    serverVersion,
    storeVersion,
  });
  const { extended } = req.query;

  if (!did || !satisfiedVersion || !blocklet) {
    return res.status(404).json({ error: 'NOT FOUND' });
  }

  const [category, owner, pricing, nftFactoryItx, specifiedVersion] = await Promise.all([
    BlockletCategory.findOne({ id: blocklet.category }),
    service.getUser(blocklet.owner.did),
    blockletPricing.findOne({ blockletId: blocklet.id }),
    createNftFactoryItx(),
    version === blocklet.currentVersion?.version
      ? Promise.resolve(blocklet.currentVersion)
      : blockletVersion.findOne({ did: blocklet.did, version }),
  ]);

  const meta =
    satisfiedVersion === blocklet.currentVersion?.version
      ? blocklet.meta
      : await getBlockletMeta(did, satisfiedVersion);
  if (!meta) {
    logger.error(
      'fail to get blocklet info',
      {
        did,
        satisfiedVersion,
      },
      req.originalUrl,
      500,
      req.headers['x-real-ip']
    );
    return res.status(500).json({ error: 'fail to get blocklet info' });
  }

  meta.repository = meta.repository
    ? {
        ...meta.repository,
        parsedUrl: parseGitUrl(meta.repository.url),
      }
    : meta.repository;

  const developer = owner ? owner.user : {};

  const officialAccounts = (env.preferences.officialAccounts || []).map((account) => account.did);
  const isOfficial = officialAccounts.includes(blocklet.ownerDid);

  return res.json({
    ...Blocklet.attachBlockletStats(
      {
        // FIXME: @zhanghan 这里的 lastPublishedAt 字段值不对，需要根据满足当前条件的 version 查询对应的发布时间
        ...blocklet,
        owner: {
          did: blocklet.owner.did,
          ...pick(developer, ['fullName', 'avatar']),
        },
        category,
        pricing,
        nftFactory: nftFactoryItx.address,
      },
      omit(meta, 'author')
    ),
    isOfficial,
    ...(extended === 'true'
      ? {
          blocklet: {
            ...omit(blocklet, ['meta', 'draftMeta', 'draftVersion']),
            specifiedVersion,
          },
        }
      : {}),
  });
};

const shouldBePublishedOrHaveSource = async (req, res, next) => {
  const { did } = req.params;
  const { version, useDraft, useReview } = req.query;

  const blocklet = await Blocklet.findOne({ did });

  if (!blocklet) {
    return res.status(404).json({ error: 'blocklet not found' });
  }
  const { currentVersion, latestVersion } = blocklet;

  const baseVersion = version || currentVersion?.version;

  if (!baseVersion) {
    return res.status(404).json({ error: 'blocklet not published' });
  }

  if (semver.gt(baseVersion, latestVersion.version)) {
    return res.status(404).json({ error: 'the version is invalid' });
  }

  req.did = did;
  req.version = baseVersion;
  req.blocklet = blocklet;
  req.useDraft = useDraft === 'true';
  req.useReview = !req.useDraft && useReview === 'true';
  return next();
};

const getPurchaserDidAndTokenSymbols = async ({ txHash }) => {
  const { info } = await client.getTx({
    hash: txHash,
  });
  if (!info) {
    throw new Error('Transaction does not exist, Please check txhash.');
  }

  const { receipts, tokenSymbols } = info;

  const { address: purchaserDid } = receipts.find((receipt) => receipt.changes[0].action === 'mint');

  return {
    purchaserDid,
    tokenSymbols,
  };
};
/**
 *
 * @description 计算收益
 * @see https://github.com/ArcBlock/blocklet-server/blob/ac7d980d698bb201fd2a168ddebad850d839a279/blocklet/meta/lib/payment.js#L8-L35
 * @see https://github.com/ArcBlock/blocklet-server/blob/ac7d980d698bb201fd2a168ddebad850d839a279/blocklet/meta/tests/payment.spec.js#L32-L36
 * @param {*} { prices, shares, tokenSymbols }
 * @return {*}
 */
const getProfitMap = ({ prices, shares, tokenSymbols }) => {
  const decimals = 1e6; // we only support 6 decimals on share ratio
  const decimalsBN = new BN(decimals);

  const sharesRatio = shares.reduce((sum, share) => new BN(sum).add(new BN(share.value * decimals)), 0);

  if (sharesRatio.div(decimalsBN).toNumber() !== 1) {
    throw new Error(`payment.share invalid: share sum should be equal to 1: ${sharesRatio}`);
  }

  const profitMap = Object.create(null);
  const tokenSymbolMap = new Map(tokenSymbols.map((t) => [t.address, t]));

  for (const share of shares) {
    for (const price of prices) {
      if (!profitMap[share.address]) {
        profitMap[share.address] = Object.create(null);
      }

      profitMap[share.address][price.address] = {
        // 收益
        profit: fromUnitToToken(
          new BN(fromTokenToUnit(price.value)).mul(new BN(share.value * decimals)).div(decimalsBN)
        ).toString(),
        // 币种
        currency: tokenSymbolMap.get(price.address).symbol,
        tokenSymbol: price.address,
      };
    }
  }

  return profitMap;
};

router.get('/:did/:version?/:tarball(*.tgz)', async (req, res) => {
  try {
    const { params, headers } = req;
    const { did, tarball } = params;
    const blocklet = await Blocklet.findOne({ did });
    if (!blocklet) {
      return res.status(404).json({ error: 'Blocklet not found' });
    }
    // TODO: 是否需要禁止 revoke 的 blocklet 下载

    // TODO: 这个地方可以选择更好的解析方法
    const regex = new RegExp(`.*${slugify(blocklet.meta?.name)}-(.*).tgz`);
    const result = regex.exec(tarball);
    if (!result || result.length < 2) {
      return res.status(400).json({ error: 'Invalid blocklet release bundle name' });
    }

    const version = result[1];

    // Check if this version has been purged
    const versionRecord = await BlockletVersion.findOne({ did, version });
    if (versionRecord?.purgedAt) {
      return res.status(410).json({
        error: 'VERSION_PURGED',
        message: 'This version is no longer available for download',
        latestVersion: blocklet.currentVersion?.version,
      });
    }

    if (!isFreeBlocklet(blocklet.meta)) {
      await verifyDownloadToken({
        blockletDid: did,
        downloadToken: headers['x-download-token'],
        storePublicKey: wallet.publicKey,
        serverDid: headers['x-server-did'],
        serverPublicKey: headers['x-server-public-key'],
        serverSignature: headers['x-server-signature'],
      });
    }
    if (req.method.toUpperCase() === 'GET') {
      try {
        const stats = blocklet?.stats ? blocklet.stats : {};
        stats.downloads = stats.downloads ? stats.downloads + 1 : 1;
        await Blocklet.update({ did }, { $set: { stats } });
      } catch (error) {
        logger.error('update stats.downloads failed', { error, did });
      }
      await BlockletDownload.insert({ did, version });
    }
    return res.sendFile(await getBlockletTarballFilepath(did, version));
  } catch (error) {
    logger.error(error, req.originalUrl, 400, req.headers['x-real-ip']);
    return res.status(400).json({ error: error.message });
  }
});

// NOTE: This is a public API
router.get(
  '/:did/blocklet.json',
  nocache(),
  checkUrlQuery({
    version: SCHEMA.version(),
    useDraft: SCHEMA.boolean(),
    useReview: SCHEMA.boolean(),
    extended: SCHEMA.boolean(),
  }),
  shouldBePublishedOrHaveSource,
  ensureVersion,
  responseBlockletJson
);

router.get(
  '/:did/readme',
  nocache(),
  checkUrlQuery({
    version: SCHEMA.version(),
    useDraft: SCHEMA.boolean(),
    useReview: SCHEMA.boolean(),
    extended: SCHEMA.boolean(),
  }),
  shouldBePublishedOrHaveSource,
  /**
   *
   * @param {express.Request} req
   * @param {express.Response} res
   * @returns
   */
  async (req, res) => {
    try {
      const { did } = req.params;
      const { useDraft, useReview } = req;
      const readmeMap = await getReadmeMap(did, ISO6391.getAllCodes(), { useDraft, useReview });
      return res.json(readmeMap);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
);

router.get(
  '/:did/versions',
  nocache(),
  checkUrlQuery({
    version: SCHEMA.version(),
    useDraft: SCHEMA.boolean(),
    useReview: SCHEMA.boolean(),
  }),
  shouldBePublishedOrHaveSource,
  async (req, res) => {
    const { did, version: currentVersion } = req;
    // 过滤掉比当前版本大的 返回给前端已发布的版本
    const where = { did, purgedAt: null };
    let versions = await BlockletVersion.find(where);
    versions = versions.filter((version) => semver.lte(version.version, currentVersion));
    return res.json(versions);
  }
);

// cache versions for 3 hours
const versionsCache = new LRUCache({ max: 100, ttl: 1000 * 60 * 60 * 3 });

// query blocklet versions by did list
router.get('/versions/batch', async (req, res) => {
  const { didList, startTime, endTime, pickFields } = req.query;
  const cacheKey = `versions_batch_${didList}_${startTime}_${endTime}_${pickFields}`;
  if (versionsCache.has(cacheKey)) {
    logger.info('hit versions batch cache', { cacheKey });
    return res.json(versionsCache.get(cacheKey));
  }

  if (!didList || didList.length === 0) {
    return res.status(400).json({ error: 'didList is required' });
  }

  let where = {
    did: { $in: didList },
    purgedAt: null,
  };

  // filter by time range
  if (startTime && endTime) {
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    where = {
      ...where,
      updatedAt: { $gte: startTimeDate, $lte: endTimeDate },
    };
  }

  let versions = await BlockletVersion.find(where);
  if (pickFields) {
    versions = versions.map((version) => pick(version, pickFields));
  }

  versionsCache.set(cacheKey, versions);

  return res.json(versions);
});

router.get('/:did/purchases', nocache(), paginate, queryOption, async (req, res) => {
  const { did } = req.params;
  const { sortBy = 'time', sortDirection = 'desc' } = req.queryOption;
  const blocklet = await Blocklet.findOne({ did });
  const { meta: blockletMeta } = blocklet;
  if (!blockletMeta || !blockletMeta.nftFactory) {
    res.json([]);
    return;
  }
  const data = await client.listTransactions({
    factoryFilter: { factories: blockletMeta.nftFactory },
    typeFilter: {
      types: ['acquire_asset_v3', 'acquire_asset_v2'],
    },
    paging: {
      cursor: (req.pagination.page - 1) * req.pagination.pageSize,
      size: req.pagination.pageSize,
      order: {
        field: sortBy,
        type: sortDirection,
      },
    },
  });
  res.json(data);
});

router.get(
  '/:did/:version/blocklet.json',
  nocache(),
  checkUrlQuery({ extended: SCHEMA.boolean() }),
  ensureUser,
  async (req, res, next) => {
    const { did } = req.params;
    const { version } = req.params;

    const blocklet = await Blocklet.findOne({ did });

    // const highPermission = req.user?.role === 'admin' || req.user?.did === blocklet?.ownerDid;
    // // 用户没有高权限,不可访问草稿版本
    // const noPermissionForDraft = !blocklet?.lastPublishedAt && !highPermission;
    // // 用户没有高权限,不可访问未发布的版本
    // const noPermissionForNoReleased =
    //   blocklet?.currentVersion?.version && semver.gt(version, blocklet.currentVersion.version) && !highPermission;

    if (!blocklet) {
      return res.status(404).json({ error: 'NOT FOUND' });
    }

    req.did = did;
    req.version = version;
    req.blocklet = blocklet;

    return next();
  },
  ensureVersion,
  responseBlockletJson
);

router.get('/:did/downloads', paginate, queryOption, nocache(), async (req, res) => {
  const { sort, keyword } = req.queryOption;
  const { did } = req.params;
  if (!sort.createdAt) {
    sort.createdAt = -1;
  }
  /**
   * sort： createdAt
   */
  const condition = { did };
  if (keyword) {
    condition.version = { [Op.like]: `%${keyword}%` };
  }
  const { list: dataList, total } = await BlockletDownload.paginate({
    condition,
    sort,
    page: req.pagination.page,
    size: req.pagination.pageSize,
  });
  res.json({ dataList, total });
});

router.get('/categories', async (_req, res) => {
  const result = await BlockletCategory.find();
  res.json(result);
});

router.get('/purchased', async (req, res) => {
  const { nftFactory = '', userDid = '' } = req.query;
  let result = 0;
  try {
    const { page } = await client.listTransactions({
      accountFilter: { accounts: userDid },
      factoryFilter: { factories: nftFactory },
      validityFilter: { validity: 'VALID' },
    });
    result = page.total || 0;
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(result);
});

router.post('/:did/comment/:version', authenticate, async (req, res) => {
  const { did, version } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  const blocklet = await Blocklet.findOne({ did });
  if (!blocklet) {
    return res.status(404).json({ error: 'blocklet not found' });
  }

  if (blocklet.ownerDid !== req.user.did && !['admin', 'owner'].includes(req.user.role)) {
    return res.status(403).json({ error: 'permission denied' });
  }

  const versionInfo = await BlockletVersion.findOne({ did, version });
  if (!versionInfo) {
    return res.status(404).json({ error: 'version not found' });
  }

  if (!versionInfo || versionInfo.status === VERSION_STATUS.DRAFT) {
    return res.status(400).json({ error: 'the version is not supported to comment' });
  }

  const result = await publishComment({ reviewId: versionInfo.id, content, author: req.user.did });
  return res.json(result);
});

// 购买blocklet成功之后给用户发送通知
// eslint-disable-next-line consistent-return
router.post('/notify/purchase', async (req, res) => {
  const { txHash, blockletDid } = req.body;
  const locale = req.headers['x-locale'];

  const blocklet = await Blocklet.findOne({
    did: blockletDid,
  });

  if (!blocklet) {
    logger.error('blocklet does not exist', { blockletDid });
    return res.status(404).json('blocklet does not exist');
  }

  const { tokenSymbols, purchaserDid } = await getPurchaserDidAndTokenSymbols({
    txHash,
  });

  const profitMap = getProfitMap({
    prices: blocklet.meta.payment.price,
    shares: blocklet.meta.payment.share,
    tokenSymbols,
  });

  logger.info('purchased', {
    prices: blocklet.meta.payment.price,
    shares: blocklet.meta.payment.share,
    purchaserDid,
    profitMap,
    txHash,
  });

  event.emit(Events.BLOCKLET_PURCHASED, {
    blockletDid,
    locale,
    transaction: { purchaserDid, profitMap, txHash },
  });

  res.send('ok');
});

router.get('/:did/downloads/monthly', async (req, res) => {
  const { did } = req.params;
  const result = await BlockletDownload.aggregate(did);
  res.json(result);
});

const topNQuery = async (count, { sort = 'stats.downloads', sortDirection = 'desc', owner, category, resourceDid }) => {
  logger.info('topNQuery', { sort, sortDirection, owner, category, resourceDid });
  const params = {
    queryOptions: {
      sort: { [sort]: sortDirection === 'desc' ? -1 : 1 },
      filter: { resourceDid, owner, category },
    },
    pagination: { page: 1, pageSize: 50 },
  };
  const list = await Blocklet.getBlockletList({
    where: Blocklet.ALL_BLOCKLETS_WHERE,
    params,
  }).then(({ dataList }) => {
    return dataList.map((item) => {
      const { meta } = item;
      return meta ? Blocklet.attachBlockletStats(item, meta) : item;
    });
  });

  return list?.slice(0, count);
};

router.get('/explore', async (req, res) => {
  let list = [];
  try {
    const top4Query = (sort) => topNQuery(4, { sort });
    const [trending, recentlyUpdated] = await Promise.all([top4Query(), top4Query('lastPublishedAt')]);
    list = [
      {
        type: 'trending',
        blocklets: trending,
      },
      {
        type: 'topRated',
        blocklets: [],
      },
      {
        type: 'recentlyUpdated',
        blocklets: recentlyUpdated,
      },
    ];
  } catch (error) {
    logger.error(error, req.originalUrl, 400, req.headers['x-real-ip']);
  }

  res.json(list);
});

/**
 * 查询公开实例，用户实际并不需要看的整个实例列表，实际只需要几条就够了，这里按照最新修改时间排序返回前 50 条实例
 */
router.get('/:did/instances', queryOption, async (req, res) => {
  const { did } = req.params;
  const { sort } = req.queryOption;
  const SIZE = 50;
  if (!sort.updatedAt) {
    sort.updatedAt = -1;
  }
  const dataList = await BlockletInstance.execQueryAndSort({ blockletDid: did }, sort, { limit: SIZE });
  return res.json(dataList);
});

const checkCanLaunch = (meta) => meta.group || meta.engine?.interpreter === 'blocklet';
router.get('/:did/:version?/info', nocache(), checkUrlQuery({ url: SCHEMA.url() }), async (req, res) => {
  const { did, version } = req.params;
  const { url } = req.query;

  const top10Query = ({ owner, category, resourceDid }) => topNQuery(10, { owner, category, resourceDid });

  try {
    const blocklet = await Blocklet.findOne({ did });

    const canLaunch = checkCanLaunch(blocklet.meta);
    const getDeps = () =>
      blocklet.meta?.resource?.bundles?.length
        ? queryBlocklets({
            query: { didList: blocklet.meta.resource.bundles.map((item) => item.did).join(',') },
          }).then(({ dataList }) => dataList)
        : Promise.resolve([]);

    const [versionInfo, deps, authorBlocklets, categoriesBlocklets, extensions] = await Promise.all([
      BlockletVersion.findOne({ did, version: version || blocklet.currentVersion?.version }),
      canLaunch
        ? parseBlocklet(url)
            .then((list) => list.map((item) => item.meta))
            .catch((error) => {
              logger.warn('Failed to parse blocklet, falling back to getDeps()', { error });
              return getDeps();
            })
        : getDeps(),
      top10Query({ owner: blocklet.owner.did }),
      blocklet.category ? top10Query({ category: blocklet.category }) : Promise.resolve([]),
      top10Query({ resourceDid: did }),
    ]);

    const useReview = [
      VERSION_STATUS.PENDING_REVIEW,
      VERSION_STATUS.IN_REVIEW,
      VERSION_STATUS.APPROVED,
      VERSION_STATUS.REJECTED,
    ].includes(versionInfo?.status);
    const useDraft = !useReview && versionInfo?.status === VERSION_STATUS.DRAFT;

    const readme = await getReadmeMap(did, ISO6391.getAllCodes(), { useDraft, useReview });

    const filterSelf = (array, count = 3) => {
      const list = [did];
      let num = 0;
      return (array || []).filter((item) => {
        if (!item || !item.did || list.includes(item.did) || num >= count) {
          return false;
        }
        list.push(item.did);
        num++;
        return true;
      });
    };

    res.json({
      readme,
      version: versionInfo,
      deps: filterSelf(deps, 100),
      extensions: filterSelf(extensions),
      authorBlocklets: filterSelf(authorBlocklets),
      categoriesBlocklets: filterSelf(categoriesBlocklets),
    });
  } catch (error) {
    logger.error('get blocklet info error:', error, req.originalUrl, 400, req.headers['x-real-ip']);
    res.status(400).json({ error: error.message });
  }
});

router.get('/resolve', checkUrlQuery({ url: SCHEMA.url() }), async (req, res) => {
  const { url } = req.query;

  try {
    const result = await parseBlocklet(url);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:did/logo', shouldBePublishedOrHaveSource, (req, res) => {
  const { did, blocklet, query } = req;
  const { useDraft, useReview } = req;
  let additionalPath = '';
  if (useDraft) {
    additionalPath = 'draft';
  } else if (useReview) {
    additionalPath = 'review';
  }
  res.redirect(
    withQuery(joinURL(ASSETS_PATH_PREFIX, did, additionalPath, blocklet.meta.logo), {
      ...query,
      // HACK: 由于 imageFilter 参数会被 service 拦截，需要避免使用该参数（使用其他名字来代替）
      // 将 imageFilter 参数还原为正确的名称
      imageFilter: query._imageFilter,
      _imageFilter: undefined,
    })
  );
});

module.exports = router;
