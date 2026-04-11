const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('purchase', 'win_reward', 'daily_bonus', 'item_use', 'refund'),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = Transaction;
