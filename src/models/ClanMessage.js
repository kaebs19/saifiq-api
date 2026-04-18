const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const ClanMessage = sequelize.define('ClanMessage', {
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
    type: DataTypes.ENUM('text', 'game_code', 'announcement', 'system'),
    defaultValue: 'text',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  roomCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  replyToId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = ClanMessage;
