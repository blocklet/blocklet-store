/* eslint-disable no-console */
require('dotenv-flow').config();

const { ensureStart } = require('@blocklet/payment-js/lib/resource');
const { server: app } = require('./functions/app');
const { init } = require('./crons');
const { syncMeilisearch } = require('./libs/meilisearch-tool');
const { mcpServer } = require('./mcp');
const ensurePaymentWebhooks = require('./routes/pricing/ensure-webhooks');
const logger = require('./libs/logger');

/* istanbul ignore next */
// eslint-disable-next-line no-underscore-dangle
if (global.__coverage__) {
  // eslint-disable-next-line
  require('@cypress/code-coverage/middleware/express')(app);
}

const port = parseInt(process.env.BLOCKLET_PORT, 10) || 3030;
const server = app.listen(port, async (err) => {
  try {
    if (err) throw err;

    init();
    syncMeilisearch();

    await mcpServer.start();

    await ensureStart(async () => {
      await ensurePaymentWebhooks();
    });

    logger.info(`> Blocklet store ready on ${port}`);
  } catch (error) {
    logger.error('app.listen.error', {
      error,
    });
  }
});

module.exports = { app, server };
