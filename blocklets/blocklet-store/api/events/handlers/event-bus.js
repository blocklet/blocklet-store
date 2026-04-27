const EventBus = require('@blocklet/sdk/service/eventbus');
const { event, Events } = require('../event');
const logger = require('../../libs/logger');
const Blocklet = require('../../db/blocklet');

const handleBlockletPublished = async ({ blockletDid }) => {
  logger.info('store.blocklet.published event received', { blockletDid });
  const blocklet = await Blocklet.findOne({ did: blockletDid });

  if (!blocklet) {
    logger.error('store.blocklet.published blocklet not found', { blockletDid });
    return;
  }

  EventBus.publish('store.blocklet.published', {
    time: blocklet.lastPublishedAt,
    data: blocklet,
  })
    .then(() => {
      logger.info('store.blocklet.published broadcast success', { blockletDid });
    })
    .catch((err) => {
      logger.error('store.blocklet.published broadcast failed', { blockletDid, error: err });
    });
};

event.on(Events.BLOCKLET_PUBLISHED, handleBlockletPublished);
event.on(Events.BLOCKLET_AUTO_PUBLISHED, handleBlockletPublished);
