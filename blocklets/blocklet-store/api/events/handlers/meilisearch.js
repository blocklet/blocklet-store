const { event, Events } = require('../event');
const MeiliSearchClient = require('../../libs/meilisearch');
const Blocklet = require('../../db/blocklet');

const meilisearchHandlers = {
  [Events.BLOCKLET_BLOCKED]: async ({ blockletId }) => {
    await MeiliSearchClient.deleteBlocklet(blockletId);
  },
  [Events.BLOCKLET_UNBLOCKED]: async ({ blockletId }) => {
    await MeiliSearchClient.addBlocklet(blockletId);
  },
  [Events.BLOCKLET_PUBLISHED]: async ({ blockletId }) => {
    await MeiliSearchClient.addBlocklet(blockletId);
  },
  [Events.BLOCKLET_CATEGORY_CHANGED]: async ({ blockletId, doc }) => {
    await MeiliSearchClient.updateBlocklet(blockletId, doc);
  },
  [Events.BLOCKLET_PERMISSION_CHANGED]: async ({ blockletId, permission }) => {
    if (permission === Blocklet.PERMISSIONS.PRIVATE) {
      await MeiliSearchClient.deleteBlocklet(blockletId);
    } else {
      await MeiliSearchClient.addBlocklet(blockletId);
    }
  },
  [Events.BLOCKLET_REVIEWED]: async ({ blockletId }) => {
    await MeiliSearchClient.addBlocklet(blockletId);
  },
  [Events.BLOCKLET_PRICING_CHANGED]: async ({ blockletId }) => {
    await MeiliSearchClient.addBlocklet(blockletId);
  },
  [Events.BLOCKLET_AUTO_PUBLISHED]: async ({ blockletId }) => {
    await MeiliSearchClient.addBlocklet(blockletId);
  },
};

Object.keys(meilisearchHandlers).forEach((key) => event.on(key, meilisearchHandlers[key]));
