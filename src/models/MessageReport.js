const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const MessageReport = sequelize.define('MessageReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  messageId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'dismissed'),
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = MessageReport;
