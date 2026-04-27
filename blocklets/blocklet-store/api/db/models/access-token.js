const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { TABLES } = require('../constant');

// access-token data example
// {
//    id: 'z1YuiBUKWsjHShHx9LsV1LXZC8TDAQobiq2',
//    publicKey: '0xfbf88b6c9e078ea17fb36ab97732fe504f7a574298ff49a2661b490d6a8c750b',
//    secretKey: 'ztLx......Gqaz',
//    userDid: 'z1gyTRAFv55f61dkpY5svRv8CydhuhgDfPZ',
//    status: 'normal',
//    remark: 'generated-for-studio',
//    createdAt: { $$date: 1719570759104 },
//    updatedAt: { $$date: 1719570759104 },
// };

// access-token model
class AccessToken extends Model {}

function initModel(sequelize) {
  AccessToken.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      publicKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      secretKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userDid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      latestUsedAt: {
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
      modelName: 'AccessToken', // We need to choose the model name
      tableName: TABLES.ACCESS_TOKENS,
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
          fields: ['userDid'],
        },
      ],
    }
  );
}

module.exports = {
  AccessToken,
  initModel,
};
