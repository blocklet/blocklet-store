const { default: axios } = require('axios');

const api = axios.create({
  timeout: 10 * 1000, // 超时时间设为10s
});

module.exports = api;
