const Cron = require('@abtnode/cron');

const logger = require('../libs/logger');
const { checkStakeRevokeTx } = require('./revoke-stake');
const { runRetentionJob } = require('./version-retention');

function init() {
  Cron.init({
    context: {},
    jobs: [
      {
        name: 'developer.stake.revoked',
        time: process.env.REVOKE_STAKE_CRON_TIME || '0 */5 * * * *',
        fn: checkStakeRevokeTx,
        options: { runOnInit: false },
      },
      {
        name: 'version.retention',
        time: process.env.VERSION_RETENTION_CRON_TIME || '0 0 3 * * *',
        fn: runRetentionJob,
        options: { runOnInit: false },
      },
    ],
    onError: (error, name) => {
      logger.error('run job failed', { name, error });
    },
  });
}

module.exports = {
  init,
};
