const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const ClanWar = sequelize.define('ClanWar', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clanAId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  clanBId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  clanAScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  clanBScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'active', 'ended'),
    defaultValue: 'scheduled',
  },
  winnerClanId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  startAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = ClanWar;
