const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Clan = sequelize.define('Clan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  badge: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  weeklyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  treasury: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  readOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = Clan;
