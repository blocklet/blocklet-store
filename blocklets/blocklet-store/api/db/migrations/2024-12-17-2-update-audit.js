const { DataTypes, Op } = require('sequelize');
const { Version } = require('../models/version');
const { Blocklet } = require('../models/blocklet');
const { VERSION_STATUS, TABLES } = require('../constant');
const logger = require('../../libs/logger');

const down = async ({ context, sequelize }) => {
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
  logger.info('start 2024-12-17-2-update-audit-up');
  try {
    const versionsDescribe = await context.describeTable(TABLES.VERSIONS);
    if (!('pendingAt' in versionsDescribe)) {
      await context.addColumn(TABLES.VERSIONS, 'pendingAt', { type: DataTypes.DATE, allowNull: true });
    }

    // if the version has publishedAt, set status to 'PUBLISHED', set approvedAt to publishedAt; else set status to 'DRAFT'
    await Version.update({ status: VERSION_STATUS.PUBLISHED }, { where: { publishedAt: { [Op.ne]: null } } });

    const allBlocklets = await Blocklet.findAll({});
    let count = 0;
    while (count < allBlocklets.length) {
      const blocklet = allBlocklets[count];

      // 从未发布过
      if (!blocklet.lastPublishedAt) {
        // eslint-disable-next-line no-await-in-loop
        await Version.update({ status: VERSION_STATUS.DRAFT }, { where: { did: blocklet.did } });
        // eslint-disable-next-line no-await-in-loop
        await Blocklet.update(
          {
            draftVersion: null,
            currentVersion: blocklet.currentVersion
              ? { ...blocklet.currentVersion, status: VERSION_STATUS.DRAFT }
              : null,
            latestVersion: { ...blocklet.latestVersion, status: VERSION_STATUS.DRAFT },
          },
          { where: { did: blocklet.did } }
        );
      } else if (blocklet.lastPublishedAt) {
        // eslint-disable-next-line no-await-in-loop
        const allVersions = await Version.findAll({ where: { did: blocklet.did }, order: [['createdAt', 'DESC']] });

        let versionIndex = 0;
        while (versionIndex < allVersions.length) {
          const currentVersion = allVersions[versionIndex];
          let status = versionIndex === 0 ? VERSION_STATUS.DRAFT : VERSION_STATUS.CANCELLED;
          // 有些情况没有更新 publishedAt, 通过 Blocklet 的 publishedAt 来判断
          if (currentVersion.publishedAt || blocklet.currentVersion?.version === currentVersion.version) {
            status = VERSION_STATUS.PUBLISHED;
          }
          // eslint-disable-next-line no-await-in-loop
          await Version.update(
            { status, ...(status === VERSION_STATUS.PUBLISHED ? { publishedAt: blocklet.lastPublishedAt } : {}) },
            { where: { did: currentVersion.did, version: currentVersion.version } }
          );
          allVersions[versionIndex].status = status;

          if (status === VERSION_STATUS.PUBLISHED) {
            break;
          }
          versionIndex += 1;
        }

        const currentVersion =
          blocklet.currentVersion && allVersions.find((v) => v.version === blocklet.currentVersion.version);

        // eslint-disable-next-line no-await-in-loop
        await Blocklet.update(
          {
            draftVersion: null,
            currentVersion,
            latestVersion: allVersions[0],
          },
          { where: { did: blocklet.did } }
        );
      }
      count += 1;
    }

    await context.removeColumn(TABLES.VERSIONS, 'updateAt');
    logger.info('end 2024-12-17-2-update-audit-up');
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
