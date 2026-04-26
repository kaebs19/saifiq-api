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
  // Spec-aligned answer type for iOS (auto-derived from `type`)
  answerType: {
    type: DataTypes.ENUM('multipleChoice', 'numericInput', 'textInput'),
    defaultValue: 'multipleChoice',
  },
  // quick_input + numeric + spec answer
  correctAnswer: {
    type: DataTypes.TEXT,
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
  hooks: {
    beforeValidate: (q) => {
      // Auto-derive answerType from type (keeps DB + API in sync)
      if (q.type === 'numeric') q.answerType = 'numericInput';
      else if (q.type === 'quick_input') q.answerType = 'textInput';
      else if (q.type === 'mcq') q.answerType = 'multipleChoice';
    },
  },
});

module.exports = Question;
