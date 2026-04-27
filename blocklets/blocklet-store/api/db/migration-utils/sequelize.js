// NOTE: add next line to keep sqlite3 in the bundle
require('sqlite3');

const { DataTypes, Sequelize } = require('sequelize');
const env = require('../../libs/env');
const { initModels } = require('./init-models');

// fix: https://github.com/sequelize/sequelize/issues/16340
const sqliteParseDate = DataTypes.sqlite.DATE.parse;
DataTypes.sqlite.DATE.parse = (date, options) => {
  if (typeof date === 'number') {
    return new Date(date);
  }
  return sqliteParseDate(date, options);
};

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.databaseUrl,
  // eslint-disable-next-line no-console
  logging: process.env.ENABLE_SEQUELIZE_LOGGING === 'true' ? console.log : false,
});

sequelize.query('pragma journal_mode = WAL;');
sequelize.query('pragma synchronous = normal;');
sequelize.query('pragma journal_size_limit = 67108864;');

initModels(sequelize);

module.exports = sequelize;
