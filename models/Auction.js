const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

  const Auction = sequelize.define(
    "Auction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      itemName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    
      startingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      bidIncrement: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currentHighestBid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      goLiveDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "active", "ended", "cancelled"),
        defaultValue: "pending",
      },
      sellerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
      },
      winnerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
      },
      finalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      sellerDecision: {
        type: DataTypes.ENUM("pending", "accepted", "rejected","counter_offered"),
        defaultValue: "pending",
      },
      counterOfferAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      counterOfferStatus: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        allowNull: true
      },
    },
)

module.exports = Auction;