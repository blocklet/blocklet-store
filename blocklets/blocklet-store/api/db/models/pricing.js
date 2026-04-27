const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { TABLES } = require('../constant');

// pricing data example
// {
//   id: string,
//   paymentType: string,
//   blockletId: string,
//   productId: string,
//   price: string,
//   priceId: string,
//   linkId: string,
//   linkUrl: string,
// };

// pricing model
class Pricing extends Model {}

function initModel(sequelize) {
  Pricing.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      paymentType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      blockletId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      priceId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      linkId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      beneficiaries: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: 'Pricing', // We need to choose the model name
      tableName: TABLES.PRICING,
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
        },
      },
      indexes: [
        {
          fields: ['blockletId'],
          unique: true,
        },
      ],
    }
  );
}

module.exports = {
  Pricing,
  initModel,
};
