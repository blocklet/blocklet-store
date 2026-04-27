const DB_NAME = {
  BLOCKLET: 'blocklet',
  BLOCKLET_CATEGORY: 'blocklet-category',
  BLOCKLET_DOWNLOAD: 'blocklet-download',
  BLOCKLET_PRICING: 'blocklet-pricing',
  BLOCKLET_VERSION: 'blocklet-version',
  MEILISEARCH_ERROR: 'meilisearch-error',
  MEILISEARCH_SYNC_FAILED: 'meilisearch-sync-failed',
  ACCESS_TOKEN: 'access-token',
};

const TABLES = {
  BLOCKLETS: 'blocklets',
  VERSIONS: 'versions',
  CATEGORIES: 'categories',
  DOWNLOADS: 'downloads',
  PRICING: 'pricing',
  ACCESS_TOKENS: 'access_tokens',
  MEILISEARCH_ERRORS: 'meilisearch_errors',
  MEILISEARCH_SYNC_FAILED: 'meilisearch_sync_failed',
};

const VERSION_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
};

const REVIEW_TYPE = {
  FIRST: 'FIRST',
  EACH: 'EACH',
};

module.exports = { DB_NAME, VERSION_STATUS, TABLES, REVIEW_TYPE };
