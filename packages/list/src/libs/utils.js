import Color from 'color';
import { cloneDeep } from 'lodash-es';
import { parseFilename, parseQuery, parseURL, stringifyParsedURL, withQuery } from 'ufo';

const isFreeBlocklet = (blocklet) => {
  if (!blocklet.payment) {
    return true;
  }
  const priceList = (blocklet.payment.price || []).map((x) => x.value || 0);
  return priceList.every((x) => x === 0);
};

export const showFilterBar = (baseSearch, showSearch, keyword) => {
  return (baseSearch && showSearch) || !keyword;
};

const getSortOptions = (t) => {
  return [
    {
      name: t('sort.popularity'),
      value: 'popularity',
    },
    {
      name: t('sort.lastPublished'),
      value: 'publishAt',
    },
    // {
    //   name: t('sort.rating'),
    //   value: 'rating',
    // },
  ];
};

export const formatImagePath = (asset, size, version) => {
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
  const { w, h } = typeof size === 'object' ? { w: size.w, h: size.h } : { w: size, h: size };
  return withQuery(asset, {
    ...(w || h ? { imageFilter: 'resize', w, h } : {}),
    v,
  });
};

const getPrices = (t) => {
  return [
    { name: t('blocklet.free'), value: 'free' },
    { name: t('blocklet.payment'), value: 'payment' },
  ];
};
const getCategoryOptions = (list = [], locale = 'en') => {
  return list.map((item) => ({ name: item.locales[locale] || item.locales.en, value: item._id }));
};

/**
 * 根据 是否付费 过滤 blocklet list
 * @param {*} list
 * @param {*} price
 * @returns
 */
const filterBlockletByPrice = (list = [], price = '') => {
  let result = list;
  if (!price) return result;
  if (price === 'free') {
    result = list.filter((blocklet) => isFreeBlocklet(blocklet));
  } else {
    result = list.filter((blocklet) => !isFreeBlocklet(blocklet));
  }
  return result;
};

const formatError = (error) => {
  if (Array.isArray(error)) {
    return error.map((x) => x.message).join('\n');
  }

  if (error.response?.data?.error) {
    return error.response.data.error.message || error.response.data.error;
  }

  return error.message || error;
};

const replaceTranslate = (template, data) =>
  // eslint-disable-next-line no-prototype-builtins
  template?.replace(/{(\w*)}/g, (m, key) => (data.hasOwnProperty(key) ? data[key] : ''));

const removeUndefined = (obj) => {
  const clone = cloneDeep(obj);
  Object.keys(clone).forEach((key) => {
    if (clone[key] === undefined) {
      delete clone[key];
    }
  });
  return clone;
};

const urlStringify = (obj) => {
  if (!obj) {
    throw new Error('obj is required in urlStringify ');
  }
  return new URLSearchParams(removeUndefined(obj)).toString();
};

const isMobileScreen = () => {
  return window.innerWidth <= 600;
};

const getCurrentPage = (length, pageSize) => {
  const page = (length + pageSize) / pageSize;
  if (page > 1) return page.toFixed();
  return 1;
};

const toColorRgb = (colorStr) => {
  const color = Color(colorStr);
  return color.rgb().object();
};

function debouncePromise(fn, time) {
  let timerId;

  return function debounced(...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    return new Promise((resolve) => {
      timerId = setTimeout(() => resolve(fn(...args)), time);
    });
  };
}
const debounced = debouncePromise((items) => Promise.resolve(items), 300);

export {
  debounced,
  filterBlockletByPrice,
  formatError,
  getCategoryOptions,
  getCurrentPage,
  getPrices,
  getSortOptions,
  isMobileScreen,
  removeUndefined,
  replaceTranslate,
  toColorRgb,
  urlStringify,
};
