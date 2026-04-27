const path = require('path');
const Config = require('@blocklet/sdk/lib/config');
const { parseTimeToMs } = require('./time');

const tempUploadDir = path.join(Config.env.dataDir, 'temp-uploads');
const blockletRootDir = path.join(Config.env.dataDir, 'blocklets');
const assetsDir = path.join(Config.env.dataDir, 'assets');
const mediaDir = path.join(assetsDir, 'media');
const databaseUrl =
  Config.env.DATABASE_URL || process.env.DATABASE_URL || path.join(Config.env.dataDir, 'blocklet-store-sqlite.db');
const { searchBlockletsInstructions } = Config.env.preferences;

const aigneApiUrl = process.env.BLOCKLET_AIGNE_API_URL;
const aigneApiProvider = process.env.BLOCKLET_AIGNE_API_PROVIDER;
const aigneApiModel = Config.env.preferences.aigneApiModel || process.env.BLOCKLET_AIGNE_API_MODEL;
const aigneApiCredential = process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
// 默认缓存 10 分钟
const aigneApiUrlCacheTTL = process.env.AIGNE_API_CACHE_TTL
  ? parseTimeToMs(process.env.AIGNE_API_CACHE_TTL)
  : parseTimeToMs('10m');
// 默认缓存 24 小时
const aigneInvokeCacheTTL = process.env.AIGNE_INVOKE_CACHE_TTL
  ? parseTimeToMs(process.env.AIGNE_INVOKE_CACHE_TTL)
  : parseTimeToMs('1d');

const AI_KIT_DID = 'z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ';

module.exports = Object.assign(Config.env, {
  chainHost: process.env.CHAIN_HOST || '',
  shareRequirement: Number(Config.env.preferences.shareRequirement || 0.3),
  launcherUrl: Config.env.preferences.launcherUrl || '',
  maxBundleSize: Number(Config.env.preferences.maxBundleSize || 500),

  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_SAMPLE_RATE:
    typeof process.env.SENTRY_SAMPLE_RATE !== 'undefined' ? Number(process.env.SENTRY_SAMPLE_RATE) : 0,

  tempUploadDir,
  blockletRootDir,
  assetsDir,
  databaseUrl,
  mediaDir,

  searchBlockletsInstructions,

  aigneApiUrl,
  aigneApiProvider,
  aigneApiModel,
  aigneApiCredential,
  AI_KIT_DID,
  aigneApiUrlCacheTTL,
  aigneInvokeCacheTTL,
});
