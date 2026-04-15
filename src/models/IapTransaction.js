const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const IapTransaction = sequelize.define('IapTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  platform: {
    type: DataTypes.ENUM('apple', 'google'),
    defaultValue: 'apple',
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  gemsAdded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  goldAdded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('verified', 'refunded'),
    defaultValue: 'verified',
  },
  rawPayload: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = IapTransaction;
