import ISO6391 from 'iso-639-1';
import { isObject } from 'lodash-es';

/**
 * 根据 languages 得到过滤后 locales 对象
 * 当 languages 的语言是 locales 中不存在的语言时，则会添加进 locales 中
 * @param {Object} locales
 * @param {Array} languages
 * @returns {Object} locales
 */
const getEditLocales = (locales = {}, languages = []) => {
  if (!isObject(locales)) {
    throw new Error('Arguments locales is not an object');
  }
  const reLocales = {};
  languages.forEach(({ code }) => {
    if (locales[code]) {
      reLocales[code] = locales[code];
    } else {
      reLocales[code] = '';
    }
  });
  return reLocales;
};

/**
 * 判断 locales 对象中的翻译项 和 languages 是否不同
 * 当 languages 中存在  locales 里没有的语言时，则认为不同 需要更新
 * @param {*} locales
 * @param {*} languages
 * @returns {boolean}
 */
const diffLocales = (locales = {}, languages = []) => {
  if (!isObject(locales)) {
    throw new Error('Arguments locales is not an object');
  }
  return languages.some(({ code }) => !locales[code]);
};

/**
 * 获得到 locales 比 languages 多出的部分
 * @param {*} locales
 * @param {*} languages
 * @returns {Object} locales
 */
const getExtraLocales = (locales = {}, languages = []) => {
  if (!isObject(locales)) {
    throw new Error('Arguments locales is not an object');
  }
  const reLocales = {};
  const languageKeys = {};
  languages.forEach(({ code }) => {
    languageKeys[code] = true;
  });
  Object.keys(locales).forEach((key) => {
    if (!languageKeys[key]) {
      reLocales[key] = locales[key];
    }
  });
  return reLocales;
};

/**
 * category 的翻译种类不是固定，随着商店中配置的语言而变化，这里展示的 category 翻译,尝试获取当前语言，失败取 locales 中的第一项
 * @param {Object} locales
 * @param {String} locale
 * @returns {Sting}
 */
const getDisplayLocale = (locales = {}, locale = '') => {
  if (!isObject(locales)) {
    throw new Error('Arguments locales is not an object');
  }
  const localeArray = Object.keys(locales);
  let index = localeArray.findIndex((key) => key === locale);
  index = index < 0 ? 0 : index;

  const localeString = locales[localeArray[index]];
  return `${localeString}-${ISO6391.getName(localeArray[index])}`;
};

const getDisplayLabel = (label) => {
  return `${label} name`;
};

const getDisplayPlaceholder = (placeholder) => {
  return `${placeholder} name of Category`;
};

export { getEditLocales, diffLocales, getExtraLocales, getDisplayLocale, getDisplayLabel, getDisplayPlaceholder };
