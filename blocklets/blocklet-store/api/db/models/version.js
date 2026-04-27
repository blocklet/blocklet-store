const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { TABLES, VERSION_STATUS } = require('../constant');

// version model
class Version extends Model {}

function initModel(sequelize) {
  Version.init(
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
      version: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      uploadedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      changeLog: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM,
        values: Object.values(VERSION_STATUS),
      },
      pendingAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      inReviewAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      canceledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      operations: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      purgedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: 'Version', // We need to choose the model name
      tableName: TABLES.VERSIONS,
      hooks: {
        // implement something like id auto-generation in nedb
        beforeCreate: (item) => {
          if (!item.id) {
            item.id = uuidv4();
          }
          const now = new Date();
          if (!item.createdAt) {
            item.createdAt = now;
          }
          if (!item.uploadedAt) {
            item.uploadedAt = now;
          }
          if (!item.status) {
            item.status = VERSION_STATUS.DRAFT;
          }
        },
      },
      indexes: [
        {
          fields: ['did'],
        },
        {
          fields: ['version'],
        },
      ],
    }
  );
}

module.exports = {
  Version,
  initModel,
};
