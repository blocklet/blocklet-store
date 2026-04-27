const { DataTypes, Op } = require('sequelize');
const { Blocklet } = require('../models/blocklet');
const { VERSION_STATUS, TABLES, REVIEW_TYPE } = require('../constant');
const logger = require('../../libs/logger');

const down = async ({ context, sequelize }) => {
  logger.info('start 2024-12-17-1-add-audit-down');
  await context.removeColumn(TABLES.VERSIONS, 'status');
  await context.removeColumn(TABLES.VERSIONS, 'penddingAt');
  await context.removeColumn(TABLES.VERSIONS, 'inReviewAt');
  await context.removeColumn(TABLES.VERSIONS, 'approvedAt');
  await context.removeColumn(TABLES.VERSIONS, 'rejectedAt');
  await context.removeColumn(TABLES.VERSIONS, 'canceledAt');
  await context.removeColumn(TABLES.VERSIONS, 'deleted');
  await context.removeColumn(TABLES.VERSIONS, 'note');
  await context.removeColumn(TABLES.VERSIONS, 'operations');

  await context.removeColumn(TABLES.BLOCKLETS, 'reviewType');
  await context.removeColumn(TABLES.BLOCKLETS, 'reviewVersion');

  const blockletsDescribe = await context.describeTable(TABLES.BLOCKLETS);
  if (!('draftVersion' in blockletsDescribe)) {
    await context.addColumn(TABLES.BLOCKLETS, 'draftVersion', { type: DataTypes.JSON });
  }
  await Blocklet.update(
    { draftVersion: sequelize.col('latestVersion') },
    { where: { currentVersion: { [Op.eq]: null } } }
  );
};

const up = async ({ context, sequelize }) => {
  logger.info('start 2024-12-17-1-add-audit-up');
  try {
    const versionsDescribe = await context.describeTable(TABLES.VERSIONS);
    if (!('status' in versionsDescribe)) {
      // status: DRAFT, PENDING_REVIEW, IN_REVIEW, APPROVED, REJECTED, PUBLISHED, CANCELLED
      await context.addColumn(TABLES.VERSIONS, 'status', {
        type: DataTypes.ENUM,
        values: Object.values(VERSION_STATUS),
      });
      await context.addColumn(TABLES.VERSIONS, 'penddingAt', { type: DataTypes.DATE, allowNull: true });
      await context.addColumn(TABLES.VERSIONS, 'inReviewAt', { type: DataTypes.DATE, allowNull: true });
      await context.addColumn(TABLES.VERSIONS, 'approvedAt', { type: DataTypes.DATE, allowNull: true });
      await context.addColumn(TABLES.VERSIONS, 'rejectedAt', { type: DataTypes.DATE, allowNull: true });
      await context.addColumn(TABLES.VERSIONS, 'canceledAt', { type: DataTypes.DATE, allowNull: true });
      await context.addColumn(TABLES.VERSIONS, 'deleted', { type: DataTypes.BOOLEAN, allowNull: true });
      await context.addColumn(TABLES.VERSIONS, 'note', { type: DataTypes.STRING, allowNull: true });
      await context.addColumn(TABLES.VERSIONS, 'operations', { type: DataTypes.JSON, allowNull: true });
    }

    const blockletsDescribe = await context.describeTable(TABLES.BLOCKLETS);
    if (!('reviewType' in blockletsDescribe)) {
      await context.addColumn(TABLES.BLOCKLETS, 'reviewType', {
        type: DataTypes.ENUM,
        values: Object.values(REVIEW_TYPE),
        defaultValue: REVIEW_TYPE.EACH,
      });
    }
    if (!('reviewVersion' in blockletsDescribe)) {
      await context.addColumn(TABLES.BLOCKLETS, 'reviewVersion', {
        type: DataTypes.JSON,
        allowNull: true,
      });
    }
    logger.info('end 2024-12-17-1-add-audit-up');
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
