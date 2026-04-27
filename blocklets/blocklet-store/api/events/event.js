const EventEmitter = require('events');

const event = new EventEmitter();

const Events = Object.freeze({
  BLOCKLET_CREATED: 'blocklet.created',

  BLOCKLET_UPLOADED: 'blocklet.uploaded',

  BLOCKLET_PUBLISHED: 'blocklet.published',

  BLOCKLET_REVIEWED: 'blocklet.reviewed',

  BLOCKLET_DISABLED_AUTO_PUBLISH: 'blocklet.disabled.auto.publish',

  BLOCKLET_ENABLED_AUTO_PUBLISH: 'blocklet.enabled.auto.publish',

  BLOCKLET_NFT_FACTORY_CHANGED: 'blocklet.nft.factory.changed',

  BLOCKLET_AUTO_PUBLISHED: 'blocklet.auto.published',

  BLOCKLET_PURCHASED: 'blocklet.purchased',

  BLOCKLET_BLOCKED: 'blocklet.blocked',

  BLOCKLET_UNBLOCKED: 'blocklet.unblocked',

  BLOCKLET_CATEGORY_CHANGED: 'blocklet.category.changed',

  BLOCKLET_PRICING_CHANGED: 'blocklet.pricing.changed',

  BLOCKLET_PERMISSION_CHANGED: 'blocklet.permission.changed',

  BLOCKLET_STAKE_REVOKED: 'blocklet.stake.revoked',

  DEVELOPER_JOINED: 'developer.joined',
  DEVELOPER_STAKE_REVOKED: 'developer.stake.revoked',
});

module.exports = {
  event,
  Events,
};
