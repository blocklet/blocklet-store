const path = require('path');
const fs = require('fs-extra');
const toMdast = require('hast-util-to-mdast');
const toMarkdown = require('mdast-util-to-markdown');
const semver = require('semver');
const { uniq } = require('lodash-es');
const { LRUCache } = require('lru-cache');
const pLimit = require('p-limit');
const { isFreeBlocklet } = require('@blocklet/meta/lib/util');
const { Op } = require('sequelize');

const { assetsDir } = require('./env');
const blockletDb = require('../db/blocklet');
const logger = require('./logger');
const BlockletVersion = require('../db/blocklet-version');
const { getChainClient, getBlockletDir } = require('./utils');
const { createNftFactoryItx } = require('./nft/blocklet-nft/create-factory');
const blockletPricing = require('../db/blocklet-pricing');

const cache = new LRUCache({ max: 100, ttl: 1000 * 60 * 2 });

const getBlockletMeta = async (did, version, withoutDBData = false) => {
  if (!did) {
    throw new Error('did argument is required');
  }

  if (!version) {
    throw new Error('version argument is required');
  }
  const key = withoutDBData ? `${did}_${version}_locale` : `${did}_${version}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const blockletDir = getBlockletDir(did, version);
  if (!fs.existsSync(blockletDir)) {
    return null;
  }

  const meta = await fs.readJSON(path.join(blockletDir, 'blocklet.json'));
  if (!withoutDBData) {
    const blocklet = await blockletDb.findOne({ 'meta.did': meta.did });
    if (blocklet && blocklet.meta) {
      const pricing = await blockletPricing.findOne({ blockletId: blocklet.id });
      blockletPricing.assignMeta(meta, pricing);
      meta.nftFactory = (await createNftFactoryItx()).address;
    }
    if (blocklet?.meta?.author) {
      delete blocklet.meta.author;
    }
  }
  cache.set(key, meta);
  return meta;
};

const getBlockletTarballFilepath = async (did, version) => {
  const blockletDir = getBlockletDir(did, version);
  const blockletMeta = await getBlockletMeta(did, version);

  return path.join(blockletDir, blockletMeta.dist.tarball);
};

/**
 *
 *
 * @param {string} did
 * @param {string} [locale='en'] locale
 * @param {string} [version] version
 * @param {string} [useDraft] useDraft
 * @param {string} [useReview] useReview
 * @return {string}
 */
function getReadme(did, locale = 'en', options = {}) {
  if (!did) {
    return '';
  }

  try {
    const { useDraft, useReview } = options;
    let additionalPath = '';
    if (useDraft) {
      additionalPath = 'draft';
    } else if (useReview) {
      additionalPath = 'review';
    }
    if (locale !== 'en') {
      const blockletMdI18nFilePath = path.join(assetsDir, did, additionalPath, `blocklet.${locale}.md`);
      if (!fs.existsSync(blockletMdI18nFilePath)) {
        return '';
      }
      return fs.readFileSync(blockletMdI18nFilePath).toString();
    }

    // 先看一下有没有blocklet.md文件
    const blockletMdFilePath = path.join(assetsDir, did, additionalPath, 'blocklet.md');
    if (fs.existsSync(blockletMdFilePath)) {
      return fs.readFileSync(blockletMdFilePath).toString();
    }

    // 再看一下有没有blocklet.ast文件,有的话,从hast转成markdown.如此,就可以兼容以前的hast了.
    const blockletMdAstFilePath = path.join(assetsDir, did, additionalPath, 'blocklet.ast');
    if (fs.existsSync(blockletMdAstFilePath)) {
      return toMarkdown(toMdast(fs.readJSONSync(blockletMdAstFilePath)));
    }

    // 还是没有找到的话,我们让 README.md 作为备选
    const readmeMdFilePath = path.join(assetsDir, did, additionalPath, 'README.md');
    if (fs.existsSync(readmeMdFilePath)) {
      return fs.readFileSync(readmeMdFilePath).toString();
    }

    return '';
  } catch (error) {
    logger.error(error);
    return '';
  }
}

/**
 *
 *
 * @param {string} did
 * @param {Array<string>} locales
 * @param {Object} options
 * @return {Promise<{
 *  [string]?: string
 * }>}
 */
// eslint-disable-next-line require-await
async function getReadmeMap(did, locales, options = {}) {
  const { useDraft, useReview } = options;
  return Promise.all(
    locales.map(async (locale) => {
      const markdown = await getReadme(did, locale, { useDraft, useReview });
      return {
        locale,
        markdown,
      };
    })
  ).then((readmes) => {
    return readmes
      .filter((readme) => readme.markdown)
      .reduce((map, readme) => {
        map[readme.locale] = readme.markdown;
        return map;
      }, Object.create(null));
  });
}

const getTokens = async () => {
  const client = getChainClient();
  const tokenList = [];
  let next = true;
  while (next) {
    // eslint-disable-next-line no-await-in-loop
    const { tokens, page } = await client.listTokens({
      paging: {
        cursor: tokenList.length,
      },
    });
    tokenList.push(...tokens);
    ({ next } = page);
  }
  return tokenList;
};
const getAddressList = (meta) => {
  const { payment } = meta;
  const list = (payment?.price || []).map((item) => item.address);
  return list;
};
/**
 *
 * @param {array} addressList
 * @return {{ address: string,issuer: string,name: string,description: string,symbol: string}}
 */
const getTokenStateList = async (addressList = []) => {
  const client = getChainClient();
  const limit = pLimit(10);
  let result = [];
  try {
    const input = uniq(addressList).map((address) => limit(() => client.getTokenState({ address })));
    result = await Promise.all(input);
  } catch (error) {
    console.error(' getTokenStateList failed', error);
  }
  return result.map((r) => r.state);
};

const getConfig = async () => {
  const client = getChainClient();
  const { config } = await client.getConfig();
  return JSON.parse(config);
};

// 增加 blocklet 的价格 symbol
const prettyPrice = (meta, tokens) => {
  try {
    // const tokens = await getTokens();
    const { payment } = meta;
    (payment?.price || []).forEach((item) => {
      const token = tokens.find((row) => row.address === item.address);
      if (token) {
        item.symbol = token.symbol;
      }
    });
  } catch (err) {
    console.error('failed to pretty price for blocklet', err);
  }
  return meta;
};

const getBlockletLogoFromDisk = (did, logo) => {
  if (!did) {
    throw new Error('did argument is required');
  }

  if (!logo) {
    throw new Error('logo argument is required');
  }

  const filepath = path.join(assetsDir, did, logo);

  if (!fs.existsSync(filepath)) {
    throw new Error('not found blocklet logo');
  }
  const blockletLogo = fs.readFileSync(filepath);
  return Buffer.from(blockletLogo, 'binary').toString('base64');
};

const checkSatisfied = () => {
  return true;
};

const getSatisfiedVersion = async (did, version, { meta, serverVersion, storeVersion } = {}) => {
  let skipCheck = false;
  if (storeVersion || !serverVersion) {
    // 直接访问 url 时默认返回最新的版本
    skipCheck = true;
  }
  const isSatisfied = skipCheck || checkSatisfied(serverVersion, meta?.requirements);

  if (isSatisfied) {
    return version;
  }

  // 过滤掉比当前版本大的 返回给前端已发布的版本
  const where = { did };
  let versions = [];
  where.publishedAt = { [Op.exists]: true };
  versions = await BlockletVersion.find(where);
  versions = versions.filter((item) => semver.gt(item.version, version));
  const sortedVersions = versions
    .map((x) => x)
    .sort((a, b) => {
      if (semver.eq(a.version, b.version)) return 0;
      if (semver.gt(a.version, b.version)) return -1;
      return 1;
    });
  for (const blockletVersion of sortedVersions) {
    // eslint-disable-next-line no-await-in-loop
    const blockletMeta = await getBlockletMeta(did, blockletVersion.version);
    if (checkSatisfied(serverVersion, blockletMeta.requirements)) {
      return blockletVersion.version;
    }
  }
  return null;
};
const getSatisfiedBlocklet = async (blocklet, { serverVersion, storeVersion }) => {
  const satisfiedVersion = await getSatisfiedVersion(blocklet.did, blocklet.version, {
    meta: blocklet,
    serverVersion,
    storeVersion,
  });
  // 如果 version 跟传入的一致，不需要去找其他版本的 meta
  if (blocklet.version === satisfiedVersion) {
    return blocklet;
  }

  if (satisfiedVersion) {
    const blockletMeta = await getBlockletMeta(blocklet.did, satisfiedVersion);
    // HACK: 额外查询的数据是不包含 price.symbol 的，需要单独补充上
    if (isFreeBlocklet(blockletMeta) === false) {
      const addressList = getAddressList(blockletMeta);
      const tokens = await getTokenStateList(addressList);
      await prettyPrice(blockletMeta, tokens);
    }
    const blockletData = { ...blocklet, ...blockletMeta };
    return blockletData;
  }
  return null;
};
const getSatisfiedBlocklets = async (blockletList, { serverVersion, storeVersion }) => {
  const pendingList = blockletList.map((item) => getSatisfiedBlocklet(item, { serverVersion, storeVersion }));
  const resultList = await Promise.all(pendingList);
  return resultList.filter((item) => !!item);
};

module.exports = {
  getConfig,
  getTokens,
  getTokenStateList,
  getAddressList,
  getBlockletDir,
  getBlockletMeta,
  getBlockletTarballFilepath,
  getReadme,
  getReadmeMap,
  prettyPrice,
  getBlockletLogoFromDisk,
  getSatisfiedVersion,
  getSatisfiedBlocklets,
};
