import translations from '../assets/locale';
import { getCategoryOptions, getPrices, isMobileScreen, replaceTranslate } from '../libs/utils';

const createRequestHeaders = (serverVersion, storeVersion) => {
  const headers = {};
  if (serverVersion) headers['x-blocklet-server-version'] = serverVersion;
  if (storeVersion) headers['x-blocklet-store-version'] = storeVersion;
  return headers;
};

const translate = (locale) => (key, data) => {
  const fallback = translations[locale] ? translations[locale][key] : translations.en[key];
  return replaceTranslate(fallback, data) || key;
};

export { createRequestHeaders, getCategoryOptions, getPrices, isMobileScreen, translate };
