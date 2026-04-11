const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const { QUESTION_TYPES, CATEGORY_CONFIG } = require('../config/constants');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM(...Object.values(QUESTION_TYPES)),
    allowNull: false,
  },
  // MCQ: [{text: "الرياض", isCorrect: true}, ...]
  options: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  // quick_input + numeric
  correctAnswer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // numeric only
  numericTolerance: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  hintText: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  timeLimitSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  category: {
    type: DataTypes.ENUM(...Object.keys(CATEGORY_CONFIG)),
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'easy',
  },
  source: {
    type: DataTypes.ENUM('admin', 'ai', 'excel'),
    defaultValue: 'admin',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  timesUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  timesCorrect: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Question;
