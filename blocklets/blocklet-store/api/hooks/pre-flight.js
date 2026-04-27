require('@blocklet/sdk/lib/error-handler');

const dotenv = require('dotenv-flow');

dotenv.config({ silent: true });

(async () => {
  try {
    // eslint-disable-next-line global-require
    const migrate = require('../db/migrate');
    await migrate();
    process.exit(0);
  } catch (err) {
    console.error('pre-flight error', err);
    process.exit(1);
  }
})();
