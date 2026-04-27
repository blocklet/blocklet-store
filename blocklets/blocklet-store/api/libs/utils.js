const path = require('path');
const semver = require('semver');
const Client = require('@ocap/client');
const fs = require('fs-extra');
const { fromBase64 } = require('@ocap/util');
const { verifyPresentation } = require('@arcblock/vc');
const pLimit = require('p-limit');
const dayjs = require('dayjs');
const { toHex } = require('@ocap/util');
const { fromPublicKey } = require('@arcblock/did');
const { toTxHash, types: mcryptoTypes } = require('@ocap/mcrypto');
const { toBase58 } = require('@ocap/util');
const { join } = require('path');
const hostedGitInfo = require('hosted-git-info');
const ISO6391 = require('iso-639-1');
const tar = require('tar');
const { joinURL } = require('ufo');
const { isValid } = require('@arcblock/did');
const pMap = require('p-map');
const { getFormattedChangelog, getChangeLogUpdates } = require('./change-log');
const { copyRecursive } = require('./fs');
const BlockletVersion = require('../db/blocklet-version');
const logger = require('./logger');
const Blocklet = require('../db/blocklet');
const { assetsDir, chainHost } = require('./env');
const SimplePorter = require('./porter/simple');
const env = require('./env');
const { wallet: authWallet } = require('./auth');
const { version: storeVersion } = require('../../package.json');
const MeiliSearchClient = require('./meilisearch');
const { VERSION_STATUS } = require('../db/constant');
const sequelize = require('../db/migration-utils/sequelize');
const { SCHEMA } = require('./schema');
const { getKeywords } = require('../mcp/ai');

let chainClient = null;

const getChainClient = () => {
  if (chainClient) {
    return chainClient;
  }

  chainClient = new Client(chainHost);
  return chainClient;
};

const getBlockletDir = (did, version) =>
  version ? path.join(env.blockletRootDir, did, version) : path.join(env.blockletRootDir, did);

/**
 *
 * @description 从一个jwt(json web token)中,获取payload
 * @see https://github.com/ArcBlock/asset-chain/blob/297a3c2aa46c911886eece56c81ee00d34d91c5b/did/jwt/tests/index.spec.js#L29-L38
 * @param {*} token
 * @return {object} 一个key-value结构的对象
 */
const getPayloadFromToken = (token) => {
  const [, payload] = token.split('.');
  return JSON.parse(fromBase64(payload));
};

/**
 * 获取指定 blocklet 的信息
 * @param {string} id 查询的 blocklet id
 * @returns {{
 *   blocklet: object;
 *   blockletVersion: string;
 *   blockletDestDir: string;
 *   filePath: string;
 * }}
 */
const getBlocklet = async (id) => {
  let blocklet;
  let blockletVersion;
  let blockletDestDir;
  let filePath;
  try {
    blocklet = await Blocklet.findOne({ id });
    blockletVersion = blocklet.reviewVersion || blocklet.latestVersion;
    blockletDestDir = getBlockletDir(blocklet.did, blockletVersion.version);
    filePath = path.join(blockletDestDir, 'blocklet.json');
  } catch (error) {
    logger.error(error);
    throw new Error(`function getBlocklet failed: ${error.message}`);
  }
  return {
    blocklet,
    blockletVersion,
    blockletDestDir,
    filePath,
  };
};
/**
 * 自动发布和手动发布中通用的代码逻辑，简单抽取了一下。
 * @param {*} blockletMeta
 * @param {*} blockletId
 */
const doBlockletPublish = async (blockletMeta, blockletId) => {
  const { filePath, blockletVersion, blocklet } = await getBlocklet(blockletId);
  const useLatestVersion = blockletMeta.version !== blocklet.reviewVersion?.version;
  const versionInfo = {
    ...(useLatestVersion ? blocklet.latestVersion : blockletVersion),
    status: VERSION_STATUS.PUBLISHED,
    publishedAt: new Date().toISOString(),
  };

  const blockletDid = blockletMeta.did;

  const { error: didError } = SCHEMA.did(true).validate(blockletDid);
  if (didError) {
    throw new Error(`invalid blocklet did: ${didError.message}`);
  }

  // 硬盘中的 meta 不写入处理后的 price
  await fs.writeFile(filePath, JSON.stringify(blockletMeta));

  // 将草稿版本的静态资源文件 移动到 正式版本的资源文件中
  let srcDir = getReviewAssetsDir(blockletDid);
  const tmpBackupDir = getTempAssetsDir(blockletDid);
  const currentStaticDir = path.join(assetsDir, blockletDid);
  try {
    if (!fs.existsSync(srcDir)) {
      srcDir = getDraftAssetsDir(blockletDid);
    }

    // 备份 currentStaticDir 下的文件到临时目录,排除 draft 和 review 和 temp 目录
    if (fs.existsSync(tmpBackupDir)) {
      fs.removeSync(tmpBackupDir);
    }
    fs.ensureDirSync(tmpBackupDir);
    const entries = await fs.promises.readdir(currentStaticDir, { withFileTypes: true });
    await pMap(
      entries,
      async (entry) => {
        if (['draft', 'review', 'temp'].includes(entry.name)) {
          return;
        }
        const srcPath = path.join(currentStaticDir, entry.name);
        const destPath = path.join(tmpBackupDir, entry.name);
        await fs.move(srcPath, destPath);
      },
      { concurrency: 5 }
    );

    await copyRecursive(srcDir, currentStaticDir);
  } catch (error) {
    logger.error(error);
    try {
      if (fs.existsSync(tmpBackupDir)) {
        await copyRecursive(tmpBackupDir, currentStaticDir);
        fs.removeSync(tmpBackupDir);
      }
    } catch {
      // ignore
    }
    throw new Error(`move blocklet static files failed: ${error.message}`);
  }

  const { draftMeta, draftPaymentShares } = blocklet;

  const transaction = await sequelize.transaction();
  const transactionTimeout = setTimeout(() => {
    transaction.rollback();
    throw new Error('transaction timeout');
  }, 300000);

  try {
    try {
      const changeLogFilePath = path.join(assetsDir, blocklet.did, 'CHANGELOG.md');
      const changeLogList = getFormattedChangelog(changeLogFilePath);

      // 更新版本状态为已发布
      await BlockletVersion.update({ did: blocklet.did, version: versionInfo.version }, versionInfo, { transaction });

      const versions = await BlockletVersion.execQueryAndSort(
        { did: blocklet.did, changeLog: { $exists: false } },
        { createdAt: -1 }
      );

      const tasks = [];
      const limit = pLimit(10);
      const updates = getChangeLogUpdates(
        changeLogList.filter((x) =>
          semver.lte(x.title, versionInfo.version) && blocklet.currentVersion
            ? semver.gt(x.title, blocklet.currentVersion.version)
            : true
        ),
        versions
      );
      for (let index = 0; index < updates.length; index++) {
        const item = updates[index];
        tasks.push(
          limit(() =>
            BlockletVersion.update(
              { version: item.version, did: blocklet.did },
              { $set: { changeLog: item.changeLog } },
              { transaction }
            )
          )
        );
      }
      await Promise.all(tasks);
    } catch (error) {
      throw new Error(`update version info failed: ${error.message}`);
    }

    // 更新 blockletMeta，写入含有 symbol 字段的 payment
    blockletMeta.payment = draftMeta?.payment;
    await Blocklet.update(
      { id: blockletId },
      {
        $set: {
          meta: blockletMeta, // 将签名后的 meta 存入表中
          currentVersion: versionInfo,
          latestVersion: versionInfo.version === blocklet.latestVersion.version ? versionInfo : blocklet.latestVersion,
          reviewVersion: null,
          draftVersion: null,
          draftMeta: null,
          draftPaymentShares: null,
          paymentShares: draftPaymentShares,
          lastPublishedAt: versionInfo.publishedAt,
        },
      },
      { transaction }
    );

    if (fs.existsSync(srcDir)) {
      fs.removeSync(srcDir);
    }
    if (fs.existsSync(tmpBackupDir)) {
      fs.removeSync(tmpBackupDir);
    }
    await transaction.commit();
    clearTimeout(transactionTimeout);
  } catch (error) {
    logger.error(error);
    clearTimeout(transactionTimeout);
    try {
      if (fs.existsSync(tmpBackupDir)) {
        await copyRecursive(tmpBackupDir, currentStaticDir);
        fs.removeSync(tmpBackupDir);
      }
      await transaction.rollback();
    } catch {
      // ignore
    }
    throw error;
  }
};
/**
 *
 * @param {*} start
 * @param {*} end
 * @returns
 */
function getAllDay(start, end) {
  const dateList = [];
  const startTime = new Date(start);
  const endTime = new Date(end);

  while (endTime.getTime() - startTime.getTime() >= 0) {
    dateList.push(dayjs(startTime).format('YYYY-MM-DD'));
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}

const getVCFromClaim = async ({ claim, challenge, trustedIssuers, vcTypes, locale = 'en' }) => {
  if (!claim || !claim.presentation) {
    return {};
  }

  const presentation = JSON.parse(claim.presentation);

  // verify challenge
  if (challenge !== presentation.challenge) {
    throw new Error(
      {
        en: 'Credential presentation does not include valid challenge',
        zh: '凭证中缺少正确的随机因子',
      }[locale]
    );
  }

  // verify presentation
  try {
    await verifyPresentation({ presentation, trustedIssuers, challenge });
  } catch (err) {
    throw new Error(
      {
        en: 'Invalid credential signature proof',
        zh: '无效的凭证签名',
      }[locale]
    );
  }

  // get vc
  const credentials = Array.isArray(presentation.verifiableCredential)
    ? presentation.verifiableCredential
    : [presentation.verifiableCredential];
  const vc = JSON.parse(credentials[0]);

  // verify vc type
  const types = [].concat(vc.type);
  if (!types.some((x) => vcTypes.includes(x))) {
    throw new Error(
      {
        en: (x) => `Invalid credential type, expect ${x.join(' or ')}`,
        zh: (x) => `无效的凭证类型，必须是 ${x.join(' 或 ')}`,
      }[locale](vcTypes)
    );
  }

  return {
    vc,
    assetDid: claim.assetDid,
  };
};

const signDownloadToken = async ({ wallet, blockletDid, serverDid, userDid }) => {
  const token = await wallet.signJWT({
    serverDid,
    userDid,
    blockletDid,
    exp: dayjs().add(100, 'year').toDate().getTime() / 1000,
  });
  return token;
};
const PurchaseVcTypes = ['BlockletPurchaseCredential'];

function getDraftAssetsDir(did) {
  return join(env.assetsDir, did, 'draft');
}
function getDraftTempAssetsDir(did) {
  return join(env.assetsDir, did, 'draft-temp');
}
function getReviewAssetsDir(did) {
  return join(env.assetsDir, did, 'review');
}
function getTempAssetsDir(did) {
  return join(env.assetsDir, did, 'temp');
}

function checkDeveloperPassport(passports) {
  // TODO: admin 和 owner 是否要支持
  // return passports.some(
  //   (x) => (x.role === 'developer' || x.role === 'admin' || x.role === 'owner') && x.status === 'valid'
  // );
  return passports.some((x) => x.role === 'developer' && x.status === 'valid');
}

function getStoreInfo() {
  return {
    id: authWallet.address, // store 自己的 did
    pk: toBase58(authWallet.publicKey),
    name: env.appName,
    description: env.appDescription,
    logoUrl: joinURL(env.appUrl, '/.well-known/service/blocklet/logo'),
    chainHost: env.chainHost,
    version: storeVersion,
    maxBundleSize: env.maxBundleSize,
  };
}

function parseGitUrl(url) {
  const info = hostedGitInfo.fromUrl(url);
  return info && info.browse();
}

async function extractTarball(tarballFilepath, targetDir) {
  fs.ensureDirSync(targetDir);

  await tar.x({
    file: tarballFilepath,
    cwd: targetDir,
  });

  return join(targetDir, 'package');
}

async function getGasPayerExtra(buffer, headers) {
  if (headers && headers['x-gas-payer-sig'] && headers['x-gas-payer-pk']) {
    return { headers };
  }

  const txHash = toTxHash(buffer);
  return {
    headers: {
      'x-gas-payer-sig': await authWallet.signJWT({ txHash }),
      'x-gas-payer-pk': authWallet.publicKey,
    },
  };
}

const queryBlocklets = async (req, isMultiple = false) => {
  const {
    pagination = { page: 1, pageSize: 100 },
    queryOption: queryOptions = { sort: {}, filter: {}, keyword: '', sortBy: '', sortDirection: '' },
    query,
  } = req;
  if (query.didList) {
    // 理论上最多支持查询25个did左右，并且did必须合法
    query.didList = query.didList
      .split(',')
      .filter((did) => isValid(did))
      .join(',');
  }
  const params = { pagination, queryOptions, query };
  let results = null;
  try {
    const { hits, estimatedTotalHits } = isMultiple
      ? await MeiliSearchClient.getMultipleBlocklets(params)
      : await MeiliSearchClient.getBlocklets(params);
    results = { total: estimatedTotalHits, dataList: hits };
  } catch (error) {
    logger.error('meilisearch error', error, req.originalUrl, 400, req.headers['x-real-ip']);
    // 使用 DB 查询时兼容处理 filter 字段
    const { category, price, owner, resourceType, resourceDid, didList, showResources } = params.query;
    const { filter } = params.queryOptions;
    filter.category = category ? [category] : [];
    filter.price = price ? [price] : [];
    filter.owner = owner ? [owner] : [];
    filter.resourceType = resourceType;
    filter.resourceDid = resourceDid;
    filter.didList = didList;
    filter.showResources = showResources;
    const blocklets = await Blocklet.getBlockletList({
      where: Blocklet.ALL_BLOCKLETS_WHERE,
      params,
    });
    const dataList = blocklets.dataList.map((item) => {
      const { meta } = item;
      if (!meta) {
        logger.warn('blocklet is empty', { did: item.did });
        return null;
      }
      return Blocklet.attachBlockletStats(item, meta);
    });
    results = { total: blocklets.total, dataList };
  }

  return results;
};

const queryBlockletsWithMultipleKeywords = async (req) => {
  const {
    pagination = { page: 1, pageSize: 100 },
    queryOption: queryOptions = { sort: {}, filter: {}, keyword: '', sortBy: '', sortDirection: '' },
    query,
  } = req;

  if (!query.keyword) {
    return queryBlocklets(req);
  }
  // 获取关键词并执行多关键词搜索
  const keywords = await getKeywords(query.keyword);

  // 为每个关键词创建独立的查询请求
  const clonedQuery = { ...query, keywords };
  const clonedReq = {
    ...req,
    query: clonedQuery,
    queryOption: { ...queryOptions, keywords },
    pagination,
  };

  return queryBlocklets(clonedReq, keywords.length > 1);
};

module.exports = {
  getChainClient,
  getPayloadFromToken,
  getBlocklet,
  getBlockletDir,
  doBlockletPublish,
  getAllDay,
  getVCFromClaim,
  signDownloadToken,
  PurchaseVcTypes,
  getDraftAssetsDir,
  getDraftTempAssetsDir,
  getReviewAssetsDir,
  getTempAssetsDir,
  queryBlocklets,
  queryBlockletsWithMultipleKeywords,
  checkDeveloperPassport,
  write(targetPath, content) {
    fs.writeFileSync(targetPath, content);
  },
  read(targetPath) {
    return fs.readFileSync(targetPath, 'utf8').toString();
  },
  toBlockletDid(name) {
    const pk = toHex(name);
    return fromPublicKey(pk, { role: mcryptoTypes.RoleType.ROLE_ANY });
  },
  getStoreInfo,
  parseGitUrl,
  extractTarball,
  getGasPayerExtra,
  async generateStaticFiles({ targetDir, blockletMeta, extractedTarballFilepath }) {
    try {
      const { did, version: blockletVersion } = blockletMeta;

      logger.info('generateStaticFiles', { did, blockletVersion, extractedTarballFilepath });

      const locales = ISO6391.getAllCodes();
      const blockletMdMetas = locales.map((locale) => {
        if (locale === 'en') {
          return {
            src: join(extractedTarballFilepath, 'blocklet.md'),
            dest: join(targetDir, 'blocklet.md'),
          };
        }
        return {
          src: join(extractedTarballFilepath, `blocklet.${locale}.md`),
          dest: join(targetDir, `blocklet.${locale}.md`),
        };
      });

      // 注意: logo不是必须的
      const logoMeta = blockletMeta.logo
        ? {
            src: join(extractedTarballFilepath, blockletMeta.logo),
            dest: join(targetDir, blockletMeta.logo),
          }
        : null;

      // 雇佣一个工人干活
      const simplePorter = new SimplePorter();
      await simplePorter.batchCopy({
        metas: [
          ...blockletMdMetas,
          logoMeta,
          {
            src: join(extractedTarballFilepath, 'README.md'),
            dest: join(targetDir, 'README.md'),
          },
          {
            src: join(extractedTarballFilepath, 'CHANGELOG.md'),
            dest: join(targetDir, 'CHANGELOG.md'),
          },
          // 截图
          {
            src: join(extractedTarballFilepath, 'screenshots'),
            dest: join(targetDir, 'screenshots'),
          },
          // 把blocklet中media目录下的文件移动到store下的assets/media集中管理
          {
            src: join(extractedTarballFilepath, 'media'),
            dest: env.mediaDir,
          },
        ],
      });
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
};
