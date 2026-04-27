const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { TABLES } = require('../constant');

// category data example
// {
// name: 'communication',
// locales: { zh: '社交与通讯', en: 'Communication' },
// id: 'KXyADwaiY5gYOK9y',
// createdAt: { $$date: 1641298995709 },
// updatedAt: { $$date: 1641298995709 },
// };

// category model
class Category extends Model {}

function initModel(sequelize) {
  Category.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: () => uuidv4(),
      },
      locales: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: 'Category', // We need to choose the model name
      tableName: TABLES.CATEGORIES,
      hooks: {
        // implement something like id auto-generation in nedb
        beforeCreate: (item) => {
          if (!item.id) {
            item.id = uuidv4();
          }
          if (!item.name) {
            item.name = uuidv4();
          }
          item.createdAt = new Date();
          item.updatedAt = new Date();
        },
      },
      indexes: [
        {
          fields: ['name'],
          unique: true,
        },
      ],
    }
  );
}

module.exports = {
  Category,
  initModel,
};
