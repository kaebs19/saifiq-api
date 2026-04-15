const { Op } = require('sequelize');
const { User, Transaction, AdminAction, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, getPageMeta } = require('../utils/pagination');

const USER_ATTRS = ['id', 'username', 'email', 'friendCode', 'avatarUrl', 'gold', 'gems', 'level', 'role'];

const searchUsers = async (query) => {
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const q = (query.q || '').trim();
  if (!q) return [];

  const users = await User.findAll({
    where: {
      [Op.or]: [
        { username: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { friendCode: q },
      ],
    },
    attributes: USER_ATTRS,
    limit,
  });
  return users;
};

const grantCurrency = async (adminId, targetUserId, { currency, amount, reason }) => {
  if (!['gold', 'gems'].includes(currency)) {
    throw new AppError('عملة غير صالحة', 400);
  }
  if (!Number.isInteger(amount) || amount === 0) {
    throw new AppError('الكمية غير صالحة', 400);
  }

  const result = await sequelize.transaction(async (t) => {
    const user = await User.findByPk(targetUserId, { lock: true, transaction: t });
    if (!user) throw new AppError('المستخدم غير موجود', 404);

    const current = user[currency];
    const newBalance = current + amount;
    if (newBalance < 0) throw new AppError('الرصيد غير كافٍ', 400);

    await user.update({ [currency]: newBalance }, { transaction: t });

    await Transaction.create({
      userId: targetUserId,
      amount,
      type: 'admin_grant',
      currency,
      description: `Admin: ${reason || 'بدون سبب'}`,
    }, { transaction: t });

    await AdminAction.create({
      adminId,
      targetUserId,
      action: 'grant',
      metadata: { currency, amount, reason: reason || null },
    }, { transaction: t });

    return { userId: targetUserId, currency, amount, newBalance };
  });

  return result;
};

const getAuditLog = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.userId) where.targetUserId = query.userId;

  const { count, rows } = await AdminAction.findAndCountAll({
    where,
    include: [
      { model: User, as: 'admin', attributes: ['id', 'username'] },
      { model: User, as: 'target', attributes: ['id', 'username'] },
    ],
    order: [['createdAt', 'DESC']],
    limit, offset,
  });

  return { actions: rows, meta: getPageMeta(count, page, limit) };
};

module.exports = { searchUsers, grantCurrency, getAuditLog };
