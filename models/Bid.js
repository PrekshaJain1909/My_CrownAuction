const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

  const Bid = sequelize.define(
    "Bid",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      auctionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Auctions',
            key: 'id'
        }
      },
      bidderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
      },
      isHighest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
  );

  module.exports = Bid;

