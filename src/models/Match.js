const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const { GAME_MODES, MATCH_STATUS } = require('../config/constants');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mode: {
    type: DataTypes.ENUM(...Object.values(GAME_MODES)),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(MATCH_STATUS)),
    defaultValue: 'waiting',
  },
  currentRound: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  currentPhase: {
    type: DataTypes.ENUM('build', 'battle', 'final'),
    allowNull: true,
  },
  winnerId: {
    type: DataTypes.UUID,
    allowNull: true,
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

module.exports = Match;
