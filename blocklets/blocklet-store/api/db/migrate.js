const { SequelizeStorage, Umzug } = require('umzug');
const sequelize = require('./migration-utils/sequelize');
const logger = require('../libs/logger');

const umzug = new Umzug({
  migrations: {
    // NOTE: relative path to migrations dir
    glob: ['**/migrations/*js', { cwd: __dirname }],
    resolve: ({ name, path, context }) => {
      logger.info('Migrate database file: ', name);

      // eslint-disable-next-line import/no-dynamic-require, global-require
      const migration = require(path);

      return {
        name: name.replace(/\.ts$/, '.js'),
        up: () => migration.up({ context, sequelize }),
        down: () => migration.down({ context, sequelize }),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger,
});

async function migrate() {
  logger.info('------ Migrate database start ------');
  await umzug.up();
  logger.info('------ Migrate database end ------');
}

module.exports = migrate;
