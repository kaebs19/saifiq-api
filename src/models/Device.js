const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  deviceToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  platform: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'ios',
  },
}, {
  timestamps: true,
  updatedAt: true,
});

module.exports = Device;
