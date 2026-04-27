import Qs from 'qs';
import { createAxios, BlockletSDK } from '@blocklet/js-sdk';
import { getVersion } from './blocklet';

const MIN_TIME = 300;
const storeVersion = getVersion();

// FIXME: @zhanghan 在 1.16.29 发布后，将 axios 和 prefix 都换成 js-sdk 中的
const prefix = window.blocklet ? window.blocklet.prefix : '/';

const api = createAxios({
  paramsSerializer: (params) => {
    return Qs.stringify(params);
  },
  headers: {
    'x-blocklet-store-version': storeVersion,
  },
});

// eslint-disable-next-line require-await
async function sleep(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function requestFn(config) {
  config.baseURL = prefix || '';
  config.timeout = 200000;
  // 请求之前加loading
  window.Pace.stop();
  window.Pace.start();
  return config;
}
function responseFn(config) {
  // 响应成功关闭loading
  window.Pace.stop();
  return config;
}
function errorFn(error) {
  window.Pace.stop();
  return Promise.reject(error);
}

api.interceptors.request.use(requestFn, errorFn);
api.interceptors.request.use(responseFn, errorFn);

const lazyApi = createAxios({
  paramsSerializer: (params) => {
    return Qs.stringify(params);
  },
  headers: {
    'x-blocklet-store-version': storeVersion,
  },
});
lazyApi.interceptors.request.use(requestFn, errorFn);
lazyApi.interceptors.request.use((config) => {
  config.metaData = { startTime: new Date() };
  window.Pace.stop();
  window.Pace.start();
  return config;
}, errorFn);

lazyApi.interceptors.response.use(async (res) => {
  res.config.metaData.endTime = new Date();
  const { startTime, endTime } = res.config.metaData;
  const timeDiff = endTime - startTime;
  if (timeDiff < MIN_TIME) await sleep(MIN_TIME - timeDiff);
  window.Pace.stop();
  return res;
}, errorFn);

const client = new BlockletSDK();

export default api;

export { lazyApi, client };
