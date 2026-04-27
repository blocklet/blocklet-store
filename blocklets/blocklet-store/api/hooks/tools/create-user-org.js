const logger = require('../../libs/logger');
const { getAllUser, getUserOrgs, createOrgForUser, setMigrated, isMigrated, isBlockletOrgEnabled } = require('./utils');

async function createUserOrg() {
  const startTime = Date.now();
  logger.info('🚀 Starting user organization migration...');

  // 检查 blocklet 是否开启了 org 模式
  const enabled = await isBlockletOrgEnabled();
  if (!enabled) {
    logger.info('✅ Blocklet org mode is not enabled, skipping...');
    return true;
  }

  // 检查是否已经迁移过
  if (isMigrated('userOrg')) {
    logger.info('✅ User organization migration already completed, skipping...');
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
    total: allUsers.length,
    success: 0,
    failed: 0,
    skipped: 0,
  };

  // 处理每个用户
  const batchSize = 50;
  const batches = Math.ceil(allUsers.length / batchSize);

  for (let batch = 0; batch < batches; batch++) {
    const start = batch * batchSize;
    const end = Math.min(start + batchSize, allUsers.length);
    const batchUsers = allUsers.slice(start, end);

    const promises = batchUsers.map(async (user) => {
      try {
        const existingOrgs = await getUserOrgs(user, { pageSize: 1 });

        if (existingOrgs && existingOrgs.length > 0) {
          return { status: 'skipped', user };
        }

        const createdOrg = await createOrgForUser(user);

        if (createdOrg) {
          return { status: 'success', user };
        }
        return { status: 'failed', user };
      } catch (error) {
        // 移除详细错误日志，仅返回失败状态
        return { status: 'failed', user, error };
      }
    });

    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.allSettled(promises);

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { status } = result.value;
        if (status === 'success') statistics.success++;
        else if (status === 'failed') statistics.failed++;
        else if (status === 'skipped') statistics.skipped++;
      } else {
        statistics.failed++;
      }
    });

    // 每10个批次或最后一个批次输出统计，减少日志输出
    if ((batch + 1) % 10 === 0 || batch === batches - 1) {
      logger.info(
        `✅ Batch ${batch + 1}/${batches} completed. Progress: ${end}/${allUsers.length}; Success: ${statistics.success}, Failed: ${statistics.failed}, Skipped: ${statistics.skipped}`
      );
    }
  }

  // 计算执行时间
  const endTime = Date.now();
  const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
  logger.info(`⏱️  createUserOrg total execution time: ${totalDuration}s`);

  // 将执行时间添加到统计数据中
  statistics.executionTime = {
    total: `${totalDuration}s`,
    getAllUser: `${getUserDuration}s`,
    processing: `${(totalDuration - getUserDuration).toFixed(2)}s`,
  };

  // 保存迁移记录（包含执行时间）
  const migrationSaved = await setMigrated({
    type: 'userOrg',
    statistics,
  });

  return migrationSaved;
}

module.exports = createUserOrg;
