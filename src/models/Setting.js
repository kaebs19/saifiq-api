const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Setting;
