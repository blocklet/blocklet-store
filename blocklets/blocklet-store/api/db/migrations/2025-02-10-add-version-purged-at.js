const { DataTypes } = require('sequelize');
const { TABLES } = require('../constant');
const logger = require('../../libs/logger');

const up = async ({ context }) => {
  logger.info('start 2025-02-10-add-version-purged-at-up');
  const describe = await context.describeTable(TABLES.VERSIONS);
  if (!('purgedAt' in describe)) {
    await context.addColumn(TABLES.VERSIONS, 'purgedAt', {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    });
    await context.addIndex(TABLES.VERSIONS, ['purgedAt']);
  }
  logger.info('end 2025-02-10-add-version-purged-at-up');
};

const down = async ({ context }) => {
  logger.info('start 2025-02-10-add-version-purged-at-down');
  await context.removeColumn(TABLES.VERSIONS, 'purgedAt');
  logger.info('end 2025-02-10-add-version-purged-at-down');
};

module.exports = { up, down };
