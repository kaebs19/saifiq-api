const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(30),
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  appleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  gems: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  gold: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  weeklyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fcmToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  friendCode: {
    type: DataTypes.STRING(8),
    unique: true,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('player', 'admin'),
    defaultValue: 'player',
  },
}, {
  timestamps: true,
});

module.exports = User;
