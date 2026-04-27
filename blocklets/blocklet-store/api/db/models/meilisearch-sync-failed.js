const { DataTypes, Model } = require('sequelize');
const { randomUUID } = require('crypto');
const { TABLES } = require('../constant');

class MeilisearchSyncFailed extends Model {}

function initModel(sequelize) {
  MeilisearchSyncFailed.init(
    {
      failedId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => randomUUID(),
      },
      id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      did: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      owner: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ownerDid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      draftVersion: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      currentVersion: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      latestVersion: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      draftMeta: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastPublishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      stats: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      permission: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      draftPaymentShares: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      paymentShares: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dependentStores: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      delegationToken: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      remark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      blockReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: 'MeilisearchSyncFailed', // We need to choose the model name
      tableName: TABLES.MEILISEARCH_SYNC_FAILED,
      hooks: {
        // implement something like id auto-generation in nedb
        beforeCreate: () => {},
      },
      indexes: [
        {
          fields: ['did'],
        },
      ],
    }
  );
}

module.exports = {
  MeilisearchSyncFailed,
  initModel,
};
