const { Item, User, UserItem, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

// ── Admin endpoints ──

const listItems = async () => {
  return Item.findAll({ order: [['goldCost', 'ASC']] });
};

const getItemById = async (id) => {
  const item = await Item.findByPk(id);
  if (!item) throw new AppError('الأداة غير موجودة', 404);
  return item;
};

const updateItem = async (id, data) => {
  const item = await getItemById(id);
  const allowed = ['nameAr', 'descriptionAr', 'goldCost', 'isActive'];
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

// ── Player endpoints ──

const listActiveItems = async () => {
  return Item.findAll({
    where: { isActive: true },
    attributes: ['id', 'type', 'nameAr', 'descriptionAr', 'goldCost'],
    order: [['goldCost', 'ASC']],
  });
};

const buyItem = async (userId, itemType) => {
  const item = await Item.findOne({ where: { type: itemType, isActive: true } });
  if (!item) throw new AppError('الأداة غير متاحة', 404);

  const result = await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { lock: true, transaction: t });
    if (!user) throw new AppError('المستخدم غير موجود', 404);
    if (user.gold < item.goldCost) throw new AppError('رصيد الذهب غير كافي', 400);

    await user.update({ gold: user.gold - item.goldCost }, { transaction: t });

    await Transaction.create({
      userId,
      amount: -item.goldCost,
      type: 'purchase',
      currency: 'gold',
      description: `شراء أداة: ${item.nameAr}`,
    }, { transaction: t });

    const [userItem] = await UserItem.findOrCreate({
      where: { userId, itemType },
      defaults: { quantity: 0 },
      transaction: t,
    });
    await userItem.update({ quantity: userItem.quantity + 1 }, { transaction: t });

    return { itemType, quantity: userItem.quantity + 1, goldSpent: item.goldCost, remainingGold: user.gold - item.goldCost };
  });

  return result;
};

const getInventory = async (userId) => {
  return UserItem.findAll({
    where: { userId, quantity: { [Op.gt]: 0 } },
    attributes: ['itemType', 'quantity'],
  });
};

module.exports = { listItems, getItemById, updateItem, toggleItem, listActiveItems, buyItem, getInventory };
