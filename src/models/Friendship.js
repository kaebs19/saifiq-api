const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Friendship = sequelize.define('Friendship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  requesterId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  addresseeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
    defaultValue: 'pending',
  },
  blockedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['requesterId', 'addresseeId'] },
  ],
});

module.exports = Friendship;
