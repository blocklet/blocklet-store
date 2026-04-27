const { DataTypes, Model } = require('sequelize');
const { randomUUID } = require('crypto');
const { TABLES } = require('../constant');

// download data example
// {
//      id: 'rVwl8O0UE5HS3zYX',
//      did: 'z8iZk7PZ3guu3biYGUJRYpAwRnMZkvQ1ENA1z',
//      version: '0.1.4',
//      downloader: 'z8iZk7PZ3guu3biYGUJRYpAwRnMZkvQ1ENA1z',
//      createdAt: { $$date: 1642507119268 },
//      updatedAt: { $$date: 1642507119268 },
// };

// download model
class Download extends Model {}

function initModel(sequelize) {
  Download.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => randomUUID(),
      },
      did: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      version: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      downloader: {
        type: DataTypes.STRING,
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
      modelName: 'Download', // We need to choose the model name
      tableName: TABLES.DOWNLOADS,
      hooks: {
        // implement something like id auto-generation in nedb
        beforeCreate: (item) => {
          if (!item.id) {
            item.id = randomUUID();
          }
          if (!item.updatedAt) {
            item.updatedAt = new Date();
          }
        },
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
  Download,
  initModel,
};
