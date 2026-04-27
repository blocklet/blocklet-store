import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { joinURL, parseFilename, parseQuery, parseURL, stringifyParsedURL, withQuery } from 'ufo';
import { Icon } from '@iconify/react';
import Coffee from '@iconify-icons/tabler/coffee';

export { getWebWalletUrl } from '@arcblock/did-connect-react/lib/utils';

/**
 *
 * @param {string} asset 文件路径
 * @param {number} [size=160] 需要裁剪的目标尺寸
 * @param {string} [version=''] 当前 blocklet 的版本号
 * @param {string} [updatedAt=''] 更新时间
 * @returns
 */
export const formatImagePath = (asset, size = 160, version = '', updatedAt = '') => {
  const urlInfo = parseURL(asset);
  const query = parseQuery(urlInfo.search);
  const isGif = parseFilename(asset, { strict: true })?.endsWith('.gif');

  // 如果 gif 图片，则不添加 imageFilter bug: https://github.com/ArcBlock/blocklet-server/issues/9969
  if (isGif) {
    return query.imageFilter ? stringifyParsedURL({ ...urlInfo, search: '' }) : asset;
  }

  if (query.imageFilter) {
    return asset;
  }

  const v = version || window.blocklet?.version;
  const { w, h } = typeof size === 'number' ? { w: size, h: size } : { w: size.w, h: size.h };
  return withQuery(asset, {
    ...(w || h ? { imageFilter: 'resize', w, h } : {}),
    v,
    ...(updatedAt ? { t: updatedAt } : {}),
  });
};

export const getBlockletJsonUrl = (did, version = '') => {
  const { prefix } = getUrlPrefix();
  return joinURL(window.location.origin, prefix, 'api', 'blocklets', did, version, 'blocklet.json');
};

export const checkCanLaunch = (meta) => meta.group || meta.engine?.interpreter === 'blocklet';

export const isOfficial = (did) => window.blocklet?.preferences?.officialAccounts?.some?.((owner) => owner.did === did);

export const getDonateSettings = (blocklet, t) => {
  return {
    target: blocklet.did,
    title: `Support: ${blocklet.title}`,
    description: blocklet.description,
    reference: window.location.href,
    beneficiaries: [
      {
        address: blocklet.owner.did,
        share: '9',
      },
      {
        address: window.blocklet.appId,
        share: '1',
      },
    ],
    appearance: {
      button: {
        id: 'blocklet-support-button',
        text: t('blocklet.support'),
        icon: <Icon icon={Coffee} />,
        size: 'large',
        variant: 'outlined',
      },
    },
  };
};

/**
 * 格式化 logo 路径
 * @param {Object} params
 * @param {string} params.did 当前 blocklet 的 did
 * @param {string} params.asset 文件路径
 * @param {string} params.version 当前 blocklet 的版本号
 * @param {number} [params.size=80] 需要裁剪的目标尺寸
 * @param {string} [params.target=asset] 文件路径前缀
 * @param {string} [params.updatedAt=''] 更新时间
 * @param {boolean} [params.useDraftSrc=false] 是否是草稿
 * @param {boolean} [params.useReviewSrc=false] 是否是审核中
 * @returns
 */
export const formatLogoPath = ({
  did,
  asset,
  version,
  size = 160,
  target = 'assets',
  updatedAt = '',
  useDraftSrc = false,
  useReviewSrc = false,
}) => {
  const result = asset.startsWith(target)
    ? asset
    : joinURL(target, did, useDraftSrc ? 'draft' : '', useReviewSrc ? 'review' : '', asset);
  return formatImagePath(result, size, version, updatedAt);
};

export const formatError = (error) => {
  if (Array.isArray(error)) {
    return error.map((x) => x.message).join('\n');
  }

  if (error.response?.data?.error) {
    return error.response.data.error.message || error.response.data.error;
  }

  return error.message || error;
};

export const formatScreenshotPath = ({ did, asset, size = 1800, useDraftSrc = false, useReviewSrc = false }) => {
  const result = asset.startsWith('assets')
    ? asset
    : joinURL('assets', did, useDraftSrc ? 'draft' : '', useReviewSrc ? 'review' : '', 'screenshots', asset);
  return `${result}?imageFilter=resize&w=${size}`;
};

export const formatPerson = (person) => {
  if (!person) {
    return '-';
  }
  if (typeof person === 'string') {
    return person;
  }

  const name = person.name || '';
  const u = person.url || person.web;
  const url = u ? ` (${u})` : '';

  return name + url;
};

export function formatToDate(date = new Date()) {
  return dayjs(date).format('ll');
}

export function formatToDatetime(date = new Date()) {
  return dayjs(date).format('lll');
}
export function formatToRelativeTime(date = new Date()) {
  return dayjs().to(dayjs(date));
}

export function formatTimeFromNow(date = new Date()) {
  const startDate = dayjs(date);
  const endDate = dayjs();

  const diffDay = endDate.diff(startDate, 'day');

  return diffDay > 3 ? formatToDate(date) : startDate.fromNow();
}
export function formatNumber(n = 0) {
  return n.toLocaleString();
}

export function getLaunchAddress(did, location, locale, version = '') {
  const urlQuery = parseQuery(location.search);
  const serverUrl = urlQuery['server-url'];
  const BLOCKLET_APP_URL = window.blocklet.appUrl;
  const LAUNCH_URL = window.localStorage.getItem('launcherUrl') || window.blocklet.preferences?.launcherUrl;
  if (!LAUNCH_URL || !BLOCKLET_APP_URL) {
    return '';
  }
  const { prefix } = getUrlPrefix();
  const metaUrl = joinURL(BLOCKLET_APP_URL, prefix, '/api/blocklets', did, version, '/blocklet.json');
  let url = null;

  if (serverUrl) {
    try {
      url = new URL(joinURL(serverUrl, '/launch-blocklet/agreement'));
    } catch (error) {
      url = new URL(LAUNCH_URL);
    }
  } else {
    url = new URL(LAUNCH_URL);
  }

  url.searchParams.set('blocklet_meta_url', metaUrl);
  url.searchParams.set('locale', locale);
  return url.href;
}

export function getUrlPrefix() {
  const prefix = window.blocklet && window.blocklet.prefix ? `${window.blocklet.prefix}` : '/';
  let apiPrefix = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (apiPrefix) {
    apiPrefix = `/${apiPrefix}`;
  }

  return { apiPrefix, prefix };
}

/**
 * debounce validate function
 * @description 给 validate 函数加上 debounce 外壳，当用户频繁触发时，只执行最后一次，并且在前面的执行中，直接返回 defaultValue
 * @param {Function} fn callback function
 * @param {Number} delay milliseconds
 * @param {Object} options
 * @returns
 */
export function debounceValidate(fn, delay = 300, { defaultValue = true } = {}) {
  let timer = null;
  let lastResolve = null;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
      lastResolve(defaultValue);
    }
    return new Promise((resolve) => {
      lastResolve = resolve;
      timer = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delay);
    });
  };
}
/**
 *
 * @param {promise} promise
 * @returns {promise}
 */
export const awaitWrap = (promise) => {
  return promise.then((data) => [undefined, data]).catch((err) => [err, undefined]);
};

export const getDisplayName = (meta = {}) => {
  return meta?.title || meta?.name;
};

/**
 *
 * @param {string} blocklet
 * @returns {boolean}
 */
export const isNoneBlocklet = (blocklet = {}) => {
  return !blocklet?.draftVersion && !blocklet?.latestVersion;
};

export const getMeta = (data, { isAdmin }) => {
  let result;
  if (!isAdmin && data.draftMeta) {
    result = data.draftMeta;
  } else {
    result = data.meta || {};
  }
  return result || {};
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const formatDownloadCount = (n = 0) => {
  if (Number.isNaN(n)) {
    return 0;
  }
  if (n < 1000) {
    return n;
  }
  if (n < 1000000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  if (n < 1000000000) {
    return `${(n / 1000000).toFixed(1)}m`;
  }
  return `${(n / 1000000000).toFixed(1)}b`;
};

const removeUndefined = (obj) => {
  const innerObj = cloneDeep(obj);
  Object.keys(innerObj).forEach((key) => {
    if (!innerObj[key]) {
      delete innerObj[key];
    }
  });
  return innerObj;
};

export const urlStringify = (obj) => {
  if (!obj) {
    throw new Error('obj is required in urlStringify ');
  }
  return new URLSearchParams(removeUndefined(obj)).toString();
};

/**
 * 属性中含有搜索关键词高亮是 meilisearch 提供的能力，我们需要做兼容，当meilisearch 不存在时，nedb 返回的数据就不含有高亮字段
 * @param {Object} params
 * @returns String
 */
export const displayAttributes = ({ blocklet, attribute, value }) => {
  if (blocklet._formatted) {
    return blocklet._formatted[attribute];
  }
  return value;
};

export const getLogoUrl = (meta, size, { isDraft, isAdmin, updatedAt }) => {
  let result = null;
  const { logo, did, version } = meta;
  let targetDir = 'assets';
  if (isDraft && !isAdmin) {
    targetDir = 'assets-draft';
  }
  const { prefix } = getUrlPrefix();
  if (logo) {
    result = joinURL(prefix, formatLogoPath({ did, asset: logo, version, size, target: targetDir, updatedAt }));
  }
  return result;
};
