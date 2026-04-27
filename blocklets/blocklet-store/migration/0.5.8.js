/* eslint-disable no-await-in-loop */
const Blocklet = require('../api/db/blocklet');
const BlockletVersion = require('../api/db/blocklet-version');
const logger = require('../api/libs/logger');

async function migrateBlocklet(blocklet) {
  // eslint-disable-next-line no-console
  let updates = {
    // blocklet 新增 permission 字段、lastPublishedAt 字段
    permission: blocklet?.permission || Blocklet.PERMISSIONS.PUBLIC,
    lastPublishedAt: null,
    // 初始化 version 相关字段，存储最新的版本信息，减少不必要的联表查询
    currentVersion: null,
    latestVersion: null,
    draftVersion: null,
  };
  // 获取当前发布的版本号ID，如果没有，则获取最新草稿版本号ID
  let versionId;
  if (blocklet.currentVersion) {
    versionId = blocklet.currentVersion;
  } else if (blocklet.draftVersion) {
    versionId = blocklet.draftVersion;
  }
  if (versionId) {
    const version = await BlockletVersion.findOne({ _id: versionId });
    // 如果已发布版本 则更新 lastPublishedAt、currentVersion、latestVersion
    // 如果已上传未发布 则更新 draftVersion、latestVersion
    updates = blocklet.currentVersion
      ? {
          ...updates,
          // 更新 lastPublishedAt 的值,因为之前的 Version 表结构中未设计 publishAt, 所以取 createdAt
          lastPublishedAt: blocklet?.lastPublishedAt || version?.uploadedAt,
          currentVersion: version,
          latestVersion: version,
        }
      : {
          ...updates,
          draftVersion: version,
          latestVersion: version,
        };
  }
  await Blocklet.update({ did: blocklet.did }, { $set: updates });
}

async function migration() {
  const blockletList = await Blocklet.find();
  try {
    for (const blocklet of blockletList) {
      try {
        await migrateBlocklet(blocklet);
      } catch (error) {
        throw new Error(`in blocklet ${blocklet.did}`);
      }
    }
    logger.info('migration@0.5.8 success!!!');
  } catch (error) {
    logger.error('migration@0.5.8 failed!!!', { error });
  }
}

migration();
