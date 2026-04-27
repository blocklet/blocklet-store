const logger = require('../libs/logger');
const createUserOrg = require('./tools/create-user-org');
const migrateBlockletToOrg = require('./tools/migrate-blocklet-to-org');

(async () => {
  try {
    logger.info('🚀 Starting post-start execution...');
    await createUserOrg();
    await migrateBlockletToOrg();
    logger.info('🎉 post-start execution completed');
    process.exit(0);
  } catch (err) {
    logger.error('❌ post-start execution failed:', err);
    process.exit(1);
  }
})();
