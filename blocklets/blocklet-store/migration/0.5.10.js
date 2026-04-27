const { isFreeBlocklet } = require('@blocklet/meta/lib/util');

const Blocklet = require('../api/db/blocklet');
const logger = require('../api/libs/logger');
const { prettyPrice, getTokens } = require('../api/libs/blocklet');

async function migrateBlocklet(blocklet, tokens) {
  // 获取当前发布的版本号ID
  let versionId;
  if (blocklet.currentVersion?._id) {
    versionId = blocklet.currentVersion?._id;
  }
  // 如果是已发布的 且是付费的 blocklet 就去 prettyPrice 处理 meta
  if (versionId) {
    const isFree = isFreeBlocklet(blocklet.meta);
    if (!isFree) {
      await prettyPrice(blocklet.meta, tokens);
      await Blocklet.update(
        { did: blocklet.did },
        {
          $set: {
            meta: blocklet.meta,
          },
        }
      );
    }
  }
}

async function migration() {
  logger.info('migration@0.5.10 start!!!');
  const blockletList = await Blocklet.find();
  try {
    const tokens = await getTokens();
    for (const blocklet of blockletList) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await migrateBlocklet(blocklet, tokens);
      } catch (error) {
        throw new Error(`${error.message} in blocklet ${blocklet.did}`);
      }
    }
    logger.info('migration@0.5.10 success!!!');
  } catch (error) {
    logger.error('migration@0.5.10 failed!!!', { error });
  }
}

migration();
