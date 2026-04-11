const { Op } = require('sequelize');
const { Transaction, User } = require('../models');
const { getPagination, getPageMeta } = require('../utils/pagination');

const listTransactions = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (query.type) where.type = query.type;
  if (query.userId) where.userId = query.userId;

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: [{ model: User, attributes: ['id', 'username', 'email', 'avatarUrl'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return { transactions: rows, meta: getPageMeta(count, page, limit) };
};

module.exports = { listTransactions };
