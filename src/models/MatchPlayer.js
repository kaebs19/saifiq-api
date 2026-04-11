const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const { PLAYER_STATUS } = require('../config/constants');

const MatchPlayer = sequelize.define('MatchPlayer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(PLAYER_STATUS)),
    defaultValue: 'active',
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  phase1Score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  castleHp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  castleMaxHp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  towerLeftHp: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  towerMidHp: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  towerRightHp: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  attacksLanded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  eliminatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = MatchPlayer;
