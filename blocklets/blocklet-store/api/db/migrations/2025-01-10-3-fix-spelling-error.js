const { TABLES } = require('../constant');
const logger = require('../../libs/logger');

const down = async ({ context }) => {
  logger.info('start 2025-01-10-3-fix-spelling-error-down');
  await context.renameColumn(TABLES.VERSIONS, 'pendingAt', 'penddingAt');
};

const up = async ({ context, sequelize }) => {
  logger.info('start 2025-01-10-3-fix-spelling-error-up');
  try {
    const versionsDescribe = await context.describeTable(TABLES.VERSIONS);
    if ('penddingAt' in versionsDescribe) {
      await context.renameColumn(TABLES.VERSIONS, 'penddingAt', 'pendingAt');
    }
    logger.info('end 2025-01-10-3-fix-spelling-error-up');
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    logger.error('Error in rename column penddingAt to pendingAt:', errorMessage);
    await down({ context, sequelize });
    throw error;
  }
};

module.exports = {
  up,
  down,
};
