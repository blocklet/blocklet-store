const path = require('path');
const pMap = require('p-map');
const fs = require('fs-extra');
const logger = require('../../libs/logger');
const { REVIEW_TYPE } = require('../constant');
const { Blocklet } = require('../models/blocklet');
const env = require('../../libs/env');
const { getDraftAssetsDir } = require('../../libs/utils');

const down = async () => {};

const isEmpty = (dir, remove = false) => {
  const files = fs.readdirSync(dir);
  if (files.length === 0) {
    if (remove) {
      fs.removeSync(dir);
    }
    return true;
  }
  return false;
};

const up = async ({ context, sequelize }) => {
  logger.info('start 2025-01-09-up');
  try {
    await Blocklet.update(
      {
        reviewType: REVIEW_TYPE.EACH,
      },
      { where: { reviewType: REVIEW_TYPE.FIRST } }
    );

    const allBlocklets = await Blocklet.findAll();
    await pMap(
      allBlocklets,
      async (blocklet) => {
        try {
          const draftStatic = path.join(env.dataDir, 'draft-assets', blocklet.did);
          if (fs.existsSync(draftStatic)) {
            const blockletDraftDir = getDraftAssetsDir(blocklet.did);
            const canMove = !fs.existsSync(blockletDraftDir) || isEmpty(blockletDraftDir, true);
            logger.info('migrate draft static', {
              did: blocklet.did.toString(),
              blockletDraftDir,
              canMove,
            });
            if (canMove) {
              await fs.move(draftStatic, blockletDraftDir);
            }
          }
        } catch (error) {
          const errorMessage = error.message || 'Unknown error';
          logger.error('migrate draft static error', {
            did: blocklet.did.toString(),
            error: errorMessage,
          });
        }
      },
      { concurrency: 3 }
    );

    logger.info('end 2025-01-09-up');
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
