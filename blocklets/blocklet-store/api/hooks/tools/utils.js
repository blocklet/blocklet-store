const path = require('path');
const fs = require('fs');
const { get } = require('lodash-es');
const { service } = require('../../libs/auth');
const { Blocklet } = require('../../db/models/blocklet');

const logger = require('../../libs/logger');

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;

const LOCAL_MIGRATED_FILE = '.orgs-migration.json';

async function getAllUser() {
  let allUsers = [];
  let currentPage = DEFAULT_PAGE;
  const maxRetries = 3;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let retryCount = 0;
    let pageData = null;

    // 重试机制
    while (retryCount < maxRetries) {
      try {
        // eslint-disable-next-line no-await-in-loop
        pageData = await service.getUsers({
          query: {
            approved: true,
          },
          paging: {
            page: currentPage,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        });
        break; // 成功则跳出重试循环
      } catch (error) {
        retryCount++;
        logger.warn(`Failed to fetch page ${currentPage}, retry ${retryCount}/${maxRetries}:`, error.message);

        if (retryCount >= maxRetries) {
          // 达到最大重试次数，直接终止
          logger.error(
            `Failed to fetch page ${currentPage} after ${maxRetries} retries. Terminating to ensure data consistency.`
          );
          return [];
        }

        // 重试前等待一段时间（指数退避）
        const delayMs = 1000 * retryCount;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, delayMs);
        });
      }
    }

    const { users, paging } = pageData;

    // 将当前页的用户添加到总列表中
    allUsers = allUsers.concat(users);

    logger.info(`Successfully fetched page ${currentPage}, got ${users.length} users. Total: ${allUsers.length}`);

    // 如果当前页是最后一页，跳出循环
    if (currentPage >= paging.pageCount) {
      break;
    }

    currentPage++;
  }

  return allUsers;
}

/**
 * 检测 blocklet 是否开启了 org 模式
 */
async function isBlockletOrgEnabled() {
  try {
    const { blocklet = {} } = await service.getBlocklet();

    return get(blocklet, 'settings.org.enabled', false);
  } catch (error) {
    logger.error('❌ Failed to get blocklet org', { error });
    return false;
  }
}

function getDataDir() {
  return process.env.BLOCKLET_DATA_DIR || '';
}

/**
 * 获取迁移文件的完整路径
 * @returns {string} 迁移文件路径
 */
function getMigrationFilePath() {
  return path.join(getDataDir(), LOCAL_MIGRATED_FILE);
}

/**
 * 读取迁移记录文件
 * @returns {object|null} 迁移记录对象，如果文件不存在则返回 null
 */
function readMigrationFile() {
  const filePath = getMigrationFilePath();

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    logger.warn(`⚠️  Failed to read migration file: ${error.message}`);
    return null;
  }
}

/**
 * 检测是否已经进行迁移
 * @param {string} type 迁移类型: 'userOrg' | 'resources' | 'all'
 * @returns {boolean} 如果已迁移返回 true，否则返回 false
 */
function isMigrated(type = 'all') {
  const migrationData = readMigrationFile();

  if (!migrationData) {
    return false;
  }

  const isUserOrgMigrated = () => {
    const { userOrg } = migrationData || {};
    const { status = '', statistics = {} } = userOrg || {};
    return status === 'success' && statistics.total > 0 && statistics.failed === 0;
  };

  const isResourcesMigrated = () => {
    const { resources } = migrationData || {};
    const { status = '', statistics = {} } = resources || {};
    return status === 'success' && statistics.total > 0 && statistics.failed === 0;
  };

  // 检查特定类型的迁移
  if (type === 'userOrg') {
    return isUserOrgMigrated();
  }

  if (type === 'resources') {
    return isResourcesMigrated();
  }

  // 检查是否所有迁移都完成，要根据数量最终判断是否完成
  if (type === 'all') {
    return isUserOrgMigrated() && isResourcesMigrated();
  }

  return false;
}

/**
 * 设置迁移完成标志，支持多步骤迁移
 * @param {object} options 配置选项
 * @param {string} options.type 迁移类型: 'userOrg' | 'resources'
 * @param {object} options.statistics 迁移统计信息
 * @returns {boolean} 写入成功返回 true，否则返回 false
 */
function setMigrated({ type = 'userOrg', statistics = {} }) {
  // 检查特定类型的迁移是否已完成
  if (isMigrated(type)) {
    logger.info(`📋 ${type} migration already completed, skipping...`);
    return true;
  }

  const filePath = getMigrationFilePath();

  try {
    // 读取已存在的迁移数据，如果不存在则创建基础结构
    let migrationData = readMigrationFile();

    if (!migrationData) {
      // 文件不存在，创建基础结构
      migrationData = {
        title: 'User Orgs Migration',
        server_version: process.env.ABT_NODE_VERSION || 'unknown',
        created_at: new Date().toISOString(),
      };
    }

    // 准备当前迁移步骤的数据
    const stepData = {
      completed_at: new Date().toISOString(),
      status: 'success',
      statistics: statistics || {
        total: 0,
        success: 0,
        failed: 0,
        skipped: 0,
      },
    };

    // 根据 type 更新对应字段
    if (type === 'userOrg') {
      migrationData.userOrg = stepData;
    } else if (type === 'resources') {
      migrationData.resources = stepData;
    } else {
      return false;
    }

    // 更新最后修改时间
    migrationData.updated_at = new Date().toISOString();

    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入迁移记录文件
    fs.writeFileSync(filePath, JSON.stringify(migrationData, null, 2), 'utf8');

    logger.info(`💾 Migration record saved to: ${filePath}`);
    logger.info(
      `📊 ${type} migration statistics: Total ${stepData.statistics.total}, Success ${stepData.statistics.success}, Failed ${stepData.statistics.failed}, Skipped ${stepData.statistics.skipped}`
    );

    return true;
  } catch (error) {
    logger.error(`❌ Failed to save migration record: ${error.message}`);
    return false;
  }
}

/**
 * 为用户创建默认 org
 * @param {*} user
 * @returns
 */
async function createOrgForUser(user) {
  try {
    const org = await service.createOrg({
      name: user.fullName,
      description: `this is a default org for ${user.fullName}`,
      ownerDid: user.did,
      deferPassport: true,
    });
    return org;
  } catch (error) {
    logger.error('❌ Failed to create user org', { userDid: user.did, error });
    return false;
  }
}

/**
 * 通过查询用户最新的 org 检测用户是否创建了 org
 */
async function getUserOrgs(user, paging = {}) {
  try {
    const { orgs } = await service.getOrgs({
      paging: { page: 1, pageSize: 10, ...paging },
      userDid: user.did,
      type: 'owned',
      options: {
        includeMembers: false,
        includePassports: false,
      },
    });
    return orgs;
  } catch (error) {
    logger.error('❌ Failed to get user orgs', { userDid: user.did, error });
    return [];
  }
}

/**
 * 获取用户所有的 blocklet
 */
function getUserBlocklets(user) {
  try {
    return Blocklet.findAll({ where: { ownerDid: user.did } });
  } catch (error) {
    logger.error('❌ Failed to get user blocklets', { userDid: user.did, error });
    return [];
  }
}

/**
 * 将 blocklet 添加到 org
 */
async function addBlockletToOrg({ orgId, resourceId }) {
  try {
    await service.addOrgResource({ orgId, resourceIds: [resourceId], type: 'blocklet' });
    return true;
  } catch (error) {
    logger.error('❌ Failed to add blocklet to org', { orgId, resourceId, error });
    return false;
  }
}

/**
 * 获取组织列表中所有资源ID
 * @param {Array} orgs 组织对象列表
 * @returns {Set} 所有组织资源ID的合并Set集合
 */
async function getOrgResources(orgs) {
  if (!orgs || orgs.length === 0) {
    return new Set();
  }

  const allResourceIds = new Set();

  // 并行查询所有组织的资源
  const promises = orgs.map(async (org) => {
    try {
      const { data = [] } = await service.getOrgResource({ orgId: org.id });
      return data.map((item) => item.resourceId);
    } catch (error) {
      return [];
    }
  });

  try {
    // 等待所有查询完成
    const results = await Promise.all(promises);

    // 将所有资源ID合并到Set中
    results.forEach((resourceIds) => {
      resourceIds.forEach((id) => allResourceIds.add(id));
    });

    return allResourceIds;
  } catch (error) {
    logger.error('❌ Failed to get resources from organizations', { error });
    return new Set();
  }
}

/**
 * 从组织列表中获取最早创建的组织
 * @param {Array} orgs 组织列表
 * @returns {Object|null} 最早创建的组织，如果列表为空则返回 null
 */
function getTargetOrg(orgs) {
  if (!orgs || orgs.length === 0) {
    return null;
  }

  if (orgs.length === 1) {
    return orgs[0];
  }

  // 找到最早创建的组织
  return orgs.reduce((earliest, current) => {
    if (!earliest.createdAt || !current.createdAt) {
      // 如果某个组织没有 createdAt，优先选择有 createdAt 的
      return current.createdAt ? current : earliest;
    }

    // 比较创建时间，返回更早的那个
    return new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest;
  });
}

module.exports = {
  getAllUser,
  readMigrationFile,
  isMigrated,
  setMigrated,
  createOrgForUser,
  getUserOrgs,
  getUserBlocklets,
  addBlockletToOrg,
  getOrgResources,
  getTargetOrg,
  isBlockletOrgEnabled,
};
