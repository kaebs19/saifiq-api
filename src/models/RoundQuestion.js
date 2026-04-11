const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const { QUESTION_TYPES } = require('../config/constants');

const RoundQuestion = sequelize.define('RoundQuestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roundId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  matchId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  questionType: {
    type: DataTypes.ENUM(...Object.values(QUESTION_TYPES)),
    allowNull: false,
  },
  winnerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  targetPlayerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  answerTimeMs: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  damageDealt: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = RoundQuestion;
