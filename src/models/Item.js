const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const { ITEM_TYPES } = require('../config/constants');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM(...Object.values(ITEM_TYPES)),
    allowNull: false,
  },
  nameAr: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descriptionAr: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  goldCost: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['type'] }],
});

module.exports = Item;
