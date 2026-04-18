const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const TreasuryTransaction = sequelize.define('TreasuryTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clanId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = TreasuryTransaction;
