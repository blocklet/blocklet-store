import { createAxios } from '@blocklet/js-sdk';

const axios = createAxios({});

axios.interceptors.request.use(
  (config) => {
    config.timeout = 200000;

    return config;
  },
  (error) => Promise.reject(error),
);

export default axios;
