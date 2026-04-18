const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const ClanEvent = sequelize.define('ClanEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clanId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  actorId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  targetId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  timestamps: true,
  updatedAt: false,
  indexes: [{ fields: ['clanId', 'createdAt'] }],
});

module.exports = ClanEvent;
