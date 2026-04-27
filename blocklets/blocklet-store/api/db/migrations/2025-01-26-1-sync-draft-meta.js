const { Op } = require('sequelize');
const pMap = require('p-map');
const logger = require('../../libs/logger');
const { Blocklet } = require('../models/blocklet');

const down = async () => {};

const up = async ({ context, sequelize }) => {
  logger.info('start 2025-01-26-1-sync-draft-meta-up');
  try {
    // 先获取所有需要更新的 blocklets
    const blocklets = await Blocklet.findAll({
      where: { draftMeta: { [Op.ne]: null } },
      attributes: ['id', 'meta', 'draftMeta'],
    });

    await pMap(blocklets, async (blocklet) => {
      const newMeta = {
        ...blocklet.draftMeta,
        ...blocklet.meta,
      };

      await Blocklet.update({ meta: newMeta }, { where: { id: blocklet.id } });
    });

    logger.info('end 2025-01-26-1-sync-draft-meta-up');
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
