const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('match_invite', 'match_result', 'gem_reward', 'system', 'admin_custom'),
    defaultValue: 'system',
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sentVia: {
    type: DataTypes.ENUM('push', 'in_app', 'both'),
    defaultValue: 'both',
  },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = Notification;
