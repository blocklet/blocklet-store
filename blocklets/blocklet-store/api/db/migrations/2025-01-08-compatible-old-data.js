const { DataTypes } = require('sequelize');
const logger = require('../../libs/logger');
const { TABLES } = require('../constant');

const down = async () => {};

const up = async ({ context, sequelize }) => {
  logger.info('start 2025-01-08-up');
  try {
    const versionsDescribe = await context.describeTable(TABLES.VERSIONS);
    if (!('uploadedAt' in versionsDescribe)) {
      await context.addColumn(TABLES.VERSIONS, 'uploadedAt', { type: DataTypes.DATE, allowNull: true });
    }
    logger.info('end 2025-01-08-up');
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    logger.error('Error in migration:', errorMessage);
    await down({ context, sequelize });
    throw error;
  }
};

module.exports = {
  up,
  down,
};
