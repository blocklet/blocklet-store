const { DataTypes, Model } = require('sequelize');
const { randomUUID } = require('crypto');
const { TABLES } = require('../constant');

// meilisearch-error data example
// {
//    blockletId: 'HCwvyN7IIG9zP3FG',
//    message: 'request to http://meilisearch/indexes/blocklets/documents failed, reason: getaddrinfo ENOTFOUND meilisearch',
//    action: 'addBlocklet',
//    id: 'caVDTUAVq2A0NfSa',
//    createdAt: { $$date: 1679903281152 },
//    updatedAt: { $$date: 1679903281152 },
// };

// meilisearch-error model
class MeilisearchError extends Model {}

function initModel(sequelize) {
  MeilisearchError.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => randomUUID(),
      },
      blockletId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: 'MeilisearchError', // We need to choose the model name
      tableName: TABLES.MEILISEARCH_ERRORS,
      hooks: {
        // implement something like id auto-generation in nedb
        beforeCreate: (item) => {
          if (!item.id) {
            item.id = randomUUID();
          }
          if (!item.createdAt) {
            item.createdAt = new Date();
          }
          if (!item.updatedAt) {
            item.updatedAt = new Date();
          }
        },
      },
      indexes: [
        {
          fields: ['blockletId'],
        },
      ],
    }
  );
}

module.exports = {
  MeilisearchError,
  initModel,
};
