const logger = require('../../libs/logger');
const {
  getAllUser,
  getUserOrgs,
  setMigrated,
  isMigrated,
  createOrgForUser,
  getUserBlocklets,
  addBlockletToOrg,
  getOrgResources,
  getTargetOrg,
  isBlockletOrgEnabled,
} = require('./utils');

const sequelize = require('../../db/migration-utils/sequelize');
const { initModels } = require('../../db/migration-utils/init-models');

async function migrateBlockletToOrg() {
  const startTime = Date.now();
  logger.info('🚀 Starting blocklet-to-org migration...');

  const enabled = await isBlockletOrgEnabled();
  if (!enabled) {
    logger.info('✅ Blocklet org mode is not enabled, skipping...');
    return true;
  }
  // 检查是否已经迁移过
  if (isMigrated('resources')) {
    logger.info('✅ Blocklet-to-org migration already completed, skipping...');
    return true;
  }

  // 获取所有用户（失败时返回空数组）
  const getUserStartTime = Date.now();
  const allUsers = await getAllUser();
  const getUserEndTime = Date.now();
  const getUserDuration = ((getUserEndTime - getUserStartTime) / 1000).toFixed(2);

  if (allUsers.length === 0) {
    logger.error('❌ No users found - this indicates a failure in fetching users. Migration aborted.');
    // 不保存迁移记录，因为这是失败状态
    return false;
  }

  logger.info(`📋 Found ${allUsers.length} users to process`);

  // 初始化统计信息
  const statistics = {
    total: 0, // 总 blocklet 数
    success: 0, // 成功迁移的 blocklet 数
    failed: 0, // 迁移失败的 blocklet 数
    skipped: 0, // 跳过的 blocklet 数（已在组织中或用户无组织）
  };

  // 初始化模型
  initModels(sequelize);

  // 处理每个用户
  const userBatchSize = 50;
  const blockletBatchSize = 50;
  const userBatches = Math.ceil(allUsers.length / userBatchSize);

  for (let batch = 0; batch < userBatches; batch++) {
    const start = batch * userBatchSize;
    const end = Math.min(start + userBatchSize, allUsers.length);
    const batchUsers = allUsers.slice(start, end);

    const userPromises = batchUsers.map(async (user) => {
      try {
        // 获取用户创建的全部组织
        let userOrgs = await getUserOrgs(user);

        // 如果用户没有组织，则创建一个组织
        if (!userOrgs || userOrgs.length === 0) {
          try {
            const org = await createOrgForUser(user);
            userOrgs = [org];
          } catch (error) {
            // 仅记录关键错误，不输出每个用户的详细信息
            return { failed: 1 };
          }
        }

        if (!userOrgs || userOrgs.length === 0) {
          return { failed: 1 };
        }

        // 获取用户组织中的所有资源ID
        const resources = await getOrgResources(userOrgs);

        // 获取用户的全部 blocklet
        const userBlocklets = await getUserBlocklets(user);

        if (!userBlocklets || userBlocklets.length === 0) {
          return { total: 0, success: 0, failed: 0, skipped: 0 };
        }

        const targetOrg = getTargetOrg(userOrgs);

        if (!targetOrg) {
          return { total: userBlocklets.length, failed: userBlocklets.length };
        }

        // 批处理用户的 blocklets
        const blockletBatches = Math.ceil(userBlocklets.length / blockletBatchSize);
        const userStats = { total: 0, success: 0, failed: 0, skipped: 0 };

        for (let bIdx = 0; bIdx < blockletBatches; bIdx++) {
          const bStart = bIdx * blockletBatchSize;
          const bEnd = Math.min(bStart + blockletBatchSize, userBlocklets.length);
          const batchBlocklets = userBlocklets.slice(bStart, bEnd);

          const blockletPromises = batchBlocklets.map(async (blocklet) => {
            // 检查 blocklet 是否已经在组织中
            if (resources.has(blocklet.id)) {
              return { status: 'skipped' };
            }

            try {
              const addResult = await addBlockletToOrg({ orgId: targetOrg.id, resourceId: blocklet.id });
              return { status: addResult ? 'success' : 'failed' };
            } catch (error) {
              // 移除详细错误日志，仅返回失败状态
              return { status: 'failed' };
            }
          });

          // eslint-disable-next-line no-await-in-loop
          const blockletResults = await Promise.allSettled(blockletPromises);

          blockletResults.forEach((result) => {
            userStats.total++;
            if (result.status === 'fulfilled') {
              const { status } = result.value;
              if (status === 'success') userStats.success++;
              else if (status === 'failed') userStats.failed++;
              else if (status === 'skipped') userStats.skipped++;
            } else {
              userStats.failed++;
            }
          });
        }

        return userStats;
      } catch (error) {
        // 移除详细错误日志，仅返回失败状态
        return { total: 0, success: 0, failed: 1, skipped: 0 };
      }
    });

    // eslint-disable-next-line no-await-in-loop
    const userResults = await Promise.allSettled(userPromises);

    // 汇总统计
    userResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const stats = result.value;
        statistics.total += stats.total || 0;
        statistics.success += stats.success || 0;
        statistics.failed += stats.failed || 0;
        statistics.skipped += stats.skipped || 0;
      } else {
        statistics.failed++;
      }
    });

    // 每10个批次或最后一个批次输出详细统计，减少日志输出
    if ((batch + 1) % 10 === 0 || batch === userBatches - 1) {
      logger.info(
        `✅ Batch ${batch + 1}/${userBatches} completed. Progress: ${end}/${allUsers.length}; Total: ${statistics.total}, Success: ${statistics.success}, Failed: ${statistics.failed}, Skipped: ${statistics.skipped}`
      );
    }
  }

  // 计算执行时间
  const endTime = Date.now();
  const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
  logger.info(`⏱️  migrateBlockletToOrg total execution time: ${totalDuration}s`);

  // 将执行时间添加到统计数据中
  statistics.executionTime = {
    total: `${totalDuration}s`,
    getAllUser: `${getUserDuration}s`,
    processing: `${(totalDuration - getUserDuration).toFixed(2)}s`,
  };

  // 保存迁移记录（包含执行时间）
  const migrationSaved = await setMigrated({
    type: 'resources',
    statistics,
  });

  return migrationSaved;
}

module.exports = migrateBlockletToOrg;
