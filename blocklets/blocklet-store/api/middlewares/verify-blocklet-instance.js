const { isFromPublicKey, toTypeInfo } = require('@arcblock/did');
const axios = require('axios');
const { joinURL } = require('ufo');
const JSON5 = require('json5');
const { decode, verify } = require('@arcblock/jwt');
const { types } = require('@ocap/mcrypto');

const logger = require('../libs/logger');
const Blocklet = require('../db/blocklet');

const getIss = (jwt) => jwt.iss.replace(/^did:abt:/, '');

module.exports = async (req, res, next) => {
  const { appPK, appId, appToken, appUrl } = req.body;
  const { did } = req.params;
  const type = toTypeInfo(appId);

  if (!appPK) {
    return res.status(400).json({ error: 'The parameter appPK is required' });
  }
  if (!appId) {
    return res.status(400).json({ error: 'The parameter appId is required' });
  }
  if (!appToken) {
    return res.status(400).json({ error: 'The parameter appToken is required' });
  }
  if (type.role !== types.RoleType.ROLE_APPLICATION) {
    return res.status(400).json({ error: 'The parameter appId is not application id' });
  }
  if (!isFromPublicKey(appId, appPK)) {
    return res.status(400).json({ error: 'The parameter appPK is invalid' });
  }
  if (appId !== getIss(decode(appToken))) {
    return res.status(400).json({ error: 'The parameter appId is invalid' });
  }

  if (!(await verify(appToken, appPK))) {
    return res.status(400).json({ error: 'The parameter appToken is invalid' });
  }

  // 如果 store 中不存在 这个blocklet
  const blocklet = Blocklet.findOne({ did });
  if (!blocklet) {
    return res.status(400).json({ error: 'The blocklet does not exist' });
  }

  let metaJS = {};
  // 获取 __blocklet__.js 校验参数中的内容
  // 如果访问不同 是用户自己的环境问题
  try {
    metaJS = await axios.get(joinURL(appUrl, '.well-known/service/__blocklet__.js'), { timeout: 1000 * 10 });
  } catch (error) {
    logger.error(error, req.originalUrl, 500, req.headers['x-real-ip']);
    return res.status(500).json({ error: error.message });
  }

  if (typeof metaJS?.data !== 'string') {
    return res.status(400).json({ error: 'The blocklet instance does not exist' });
  }

  const metaStr = metaJS.data.trim().replace(/window\.blocklet\s*=/, '');
  const finalMeta = JSON5.parse(metaStr);

  if (finalMeta.appId !== appId) {
    return res.status(400).json({ error: 'The parameter appId is invalid' });
  }

  return next();
};
