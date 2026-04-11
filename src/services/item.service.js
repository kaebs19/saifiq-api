const { Item } = require('../models');
const AppError = require('../utils/AppError');

const listItems = async () => {
  return Item.findAll({ order: [['gemCost', 'ASC']] });
};

const getItemById = async (id) => {
  const item = await Item.findByPk(id);
  if (!item) throw new AppError('\u0627\u0644\u0623\u062F\u0627\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629', 404);
  return item;
};

const updateItem = async (id, data) => {
  const item = await getItemById(id);
  const allowed = ['nameAr', 'descriptionAr', 'gemCost', 'isActive'];
  const patch = {};
  for (const key of allowed) if (data[key] !== undefined) patch[key] = data[key];
  await item.update(patch);
  return item;
};

const toggleItem = async (id) => {
  const item = await getItemById(id);
  await item.update({ isActive: !item.isActive });
  return item;
};

module.exports = { listItems, getItemById, updateItem, toggleItem };
