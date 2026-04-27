const path = require('path');
const { dataDir } = require('./env');

module.exports = Object.freeze({
  BLOCKLET_STATUS: Object.freeze({
    normal: 'normal',
    deprecated: 'deprecated',
  }),
  REVIEW_BOARD_ID: '6c84fb90-12c4-11e1-840d-7b25c5ee775a',
  DISCUSS_KIT_DID: 'z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu',
  ASSETS_PATH_PREFIX: '/assets',
  DRAFT_ASSETS_PATH_PREFIX: '/assets-draft',
  MS_BINARY_NAME: 'meilisearch',
  MS_BINARY_PATH: path.join(dataDir, 'meilisearch', 'meilisearch'),
  INDEX_SETTINGS: {
    displayedAttributes: ['*'],
    searchableAttributes: [
      'title',
      'name',
      'description',
      'keywords',
      'version',
      'did',
      'owner.did',
      'ownerDid',
      'id',
      '_id',
    ],
    filterableAttributes: [
      'did',
      'category.id',
      'category._id',
      'owner.did',
      'ownerDid',
      'engine.interpreter',
      'group',
      'createdAt',
      'payment.price.value',
      'resource.bundles.type',
      'resource.bundles.did',
      'resource.bundles.public',
    ],
    sortableAttributes: ['lastPublishedAt', 'stats.downloads', 'title'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    stopWords: [],
    synonyms: {},
    distinctAttribute: null,
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 5,
        twoTypos: 9,
      },
      disableOnWords: [],
      disableOnAttributes: [],
    },
    faceting: {
      maxValuesPerFacet: 100,
    },
    pagination: {
      maxTotalHits: 1000,
    },
  },
  INDEX_NAME: 'blocklets',
  MAX_RETRY_COUNT: 2,
  PAYMENT_TYPE: Object.freeze({
    FREE: 'free',
    PAID_ONE_TIME: 'paid-one-time',
  }),
  LOCALE_NAME: 'nf_lang',
});
