const en = require('./en');
const zh = require('./zh');

const locales = { en, zh };

// eslint-disable-next-line @typescript-eslint/default-param-last
const replace = (template = '', data) => template.replace(/{(\w*)}/g, (_, key) => (Object.prototype.hasOwnProperty.call(data, key) ? data[key] : '')); // prettier-ignore

/**
 *
 *
 * @param {string} key
 * @param {'en' | 'zh'} locale
 * @param {{
 *  [key: string]: string
 * }} params
 * @return {*}
 */
const t = (key, locale, params = {}) => {
  if (!locales[locale]) {
    // eslint-disable-next-line no-param-reassign
    locale = 'en';
  }

  return replace(locales[locale][key], params) || key;
};

const createTranslateFunc = (locale) => (key, params) => t(key, locale || 'en', params);

module.exports = {
  t,
  createTranslateFunc,
};
