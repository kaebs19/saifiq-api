const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const ClanMember = sequelize.define('ClanMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clanId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    defaultValue: 'member',
  },
  weeklyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['clanId', 'userId'] }],
});

module.exports = ClanMember;
