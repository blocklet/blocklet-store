const { env } = require('@blocklet/sdk/lib/env');
const { joinURL } = require('ufo');
const { service } = require('./auth');
const logger = require('./logger');

const { appUrl } = env;

function assertBlocklet(blocklet) {
  if (!blocklet) {
    throw new Error('blocklet is invalid!');
  }
}

/**
 *
 * @description 获取blocklet的名称
 * @param {*} blocklet
 * @return {*}
 */
function getBlockletName(blocklet) {
  assertBlocklet(blocklet);
  return blocklet?.meta?.title || blocklet?.meta?.name;
}

/**
 *
 * @description 获取最新的版本号
 * @memberof Blocklet
 */
function getBlockletLatestVersion(blocklet) {
  assertBlocklet(blocklet);
  return blocklet?.latestVersion?.version;
}

/**
 *
 * @description 获取blocklet的网址
 * @param {*} blocklet
 * @param {*} version
 * @return {*}
 */
function getBlockletUrl(blocklet, version = '') {
  assertBlocklet(blocklet);
  return joinURL(appUrl, '/blocklets', blocklet.did, version);
}
/**
 *
 * @description 获取blocklet已发布的版本号
 * @param {*} blocklet
 * @return {*}
 */
function getBlockletReleasedVersion(blocklet) {
  assertBlocklet(blocklet);

  return blocklet.meta.version || '0.0.0';
}

/**
 *
 * @description 获取developer的did(注意: developer的did和blocklet.owner.did等价)
 * @param {*} blocklet
 * @return { Promise<{did: string, locale: string}> }
 */
async function getBlockletOwner(blocklet, locale = 'en') {
  assertBlocklet(blocklet);
  try {
    const { user } = await service.getUser(blocklet.owner.did);
    return {
      ...user,
      locale: user.locale || locale,
    };
  } catch (error) {
    logger.error('Failed to get blocklet owner', { error });
    return {
      did: blocklet.ownerDid,
      locale,
    };
  }
}

async function getBlockletOwnerName(blocklet) {
  assertBlocklet(blocklet);
  try {
    const { user } = await service.getUser(blocklet.ownerDid);
    return `${user.fullName} (${user.did})`;
  } catch (error) {
    throw new Error('Failed to get blocklet owner');
  }
}

module.exports = {
  getBlockletName,
  getBlockletLatestVersion,
  getBlockletUrl,
  getBlockletReleasedVersion,
  getBlockletOwnerName,
  getBlockletOwner,
};
