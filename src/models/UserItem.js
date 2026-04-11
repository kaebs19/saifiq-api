const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const { ITEM_TYPES } = require('../config/constants');

const UserItem = sequelize.define('UserItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  itemType: {
    type: DataTypes.ENUM(...Object.values(ITEM_TYPES)),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = UserItem;
