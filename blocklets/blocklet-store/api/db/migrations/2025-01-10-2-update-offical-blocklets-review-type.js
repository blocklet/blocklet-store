const { Op } = require('sequelize');
const logger = require('../../libs/logger');
const { REVIEW_TYPE } = require('../constant');
const { Blocklet } = require('../models/blocklet');
const env = require('../../libs/env');

const down = async () => {};

const up = async ({ context, sequelize }) => {
  logger.info('start 2025-01-10-2-up');
  try {
    const officialAccounts = env.preferences?.officialAccounts || [];
    if (officialAccounts.length === 0) {
      logger.info('no official accounts');
    } else {
      const result = await Blocklet.update(
        {
          reviewType: REVIEW_TYPE.FIRST,
        },
        { where: { ownerDid: { [Op.in]: officialAccounts.map((item) => item.did.toString()) } } }
      );
      logger.info(`update official blocklets review type to ${REVIEW_TYPE.FIRST}. Count:`, result);
    }
    logger.info('end 2025-01-10-2-up');
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    logger.error('Error in migration:', errorMessage);
    await down({ context, sequelize });
  }
};

module.exports = {
  up,
  down,
};
