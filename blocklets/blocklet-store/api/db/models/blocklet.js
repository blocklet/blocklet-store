const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { TABLES, REVIEW_TYPE } = require('../constant');

class Blocklet extends Model {}

function initModel(sequelize) {
  Blocklet.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      did: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      owner: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      ownerDid: {
        type: DataTypes.STRING,
        allowNull: true, // just for meilisearch sync, it should not be null
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      draftVersion: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      reviewVersion: {
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
        allowNull: false,
      },
      meta: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      draftMeta: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      reviewType: {
        type: DataTypes.STRING,
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
      modelName: 'Blocklet', // We need to choose the model name
      tableName: TABLES.BLOCKLETS,
      hooks: {
        // implement something like id auto-generation in nedb
        beforeCreate: (item) => {
          if (!item.id) {
            item.id = uuidv4();
          }
          if (!item.createdAt) {
            item.createdAt = new Date();
          }
          if (!item.updatedAt) {
            item.updatedAt = new Date();
          }
          if (!item.ownerDid) {
            item.ownerDid = item.owner.did;
          }
          if (!item.reviewType) {
            item.reviewType = REVIEW_TYPE.EACH;
          }
        },
      },
      indexes: [
        {
          fields: ['did'],
          unique: true,
        },
        {
          fields: ['ownerDid'],
        },
      ],
    }
  );
}

module.exports = {
  Blocklet,
  initModel,
};
