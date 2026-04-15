const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const AdminAction = sequelize.define('AdminAction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  targetUserId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = AdminAction;
