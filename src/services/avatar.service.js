const { Avatar, User, Transaction, sequelize } = require('../models');
const AppError = require('../utils/AppError');

// ── Player endpoints ──

const listAvatars = async () => {
  return Avatar.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC']],
    attributes: ['id', 'name', 'imageUrl', 'gemCost', 'sortOrder'],
  });
};

const selectAvatar = async (userId, avatarId) => {
  const avatar = await Avatar.findByPk(avatarId);
  if (!avatar || !avatar.isActive) {
    throw new AppError('الصورة غير متاحة', 404);
  }

  const user = await User.findByPk(userId);
  if (!user) throw new AppError('المستخدم غير موجود', 404);

  // If already using this avatar, skip
  if (user.avatarUrl === avatar.imageUrl) {
    return { avatarUrl: avatar.imageUrl };
  }

  // Free avatar — just update
  if (avatar.gemCost === 0) {
    await user.update({ avatarUrl: avatar.imageUrl });
    return { avatarUrl: avatar.imageUrl };
  }

  // Paid avatar — check balance & deduct gems
  if (user.gems < avatar.gemCost) {
    throw new AppError(`رصيدك غير كافٍ، تحتاج ${avatar.gemCost} جوهرة`, 400);
  }

  await sequelize.transaction(async (t) => {
    await user.update(
      { gems: user.gems - avatar.gemCost, avatarUrl: avatar.imageUrl },
      { transaction: t },
    );
    await Transaction.create({
      userId,
      amount: -avatar.gemCost,
      type: 'purchase',
      description: `شراء صورة شخصية: ${avatar.name}`,
    }, { transaction: t });
  });

  return { avatarUrl: avatar.imageUrl, gemsDeducted: avatar.gemCost };
};

// ── Admin endpoints ──

const listAllAvatars = async () => {
  return Avatar.findAll({ order: [['sortOrder', 'ASC']] });
};

const createAvatar = async (data) => {
  return Avatar.create(data);
};

const updateAvatar = async (id, data) => {
  const avatar = await Avatar.findByPk(id);
  if (!avatar) throw new AppError('الصورة غير موجودة', 404);
  await avatar.update(data);
  return avatar;
};

const toggleAvatar = async (id) => {
  const avatar = await Avatar.findByPk(id);
  if (!avatar) throw new AppError('الصورة غير موجودة', 404);
  await avatar.update({ isActive: !avatar.isActive });
  return avatar;
};

module.exports = { listAvatars, selectAvatar, listAllAvatars, createAvatar, updateAvatar, toggleAvatar };
