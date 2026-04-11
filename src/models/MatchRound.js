const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const MatchRound = sequelize.define('MatchRound', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  roundNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  phase: {
    type: DataTypes.ENUM('build', 'battle', 'final'),
    allowNull: false,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = MatchRound;
