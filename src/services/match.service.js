const { Op } = require('sequelize');
const { Match, MatchPlayer, User } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, getPageMeta } = require('../utils/pagination');

const listMatches = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (query.status) where.status = query.status;
  if (query.mode) where.mode = query.mode;
  if (query.from) where.createdAt = { [Op.gte]: new Date(query.from) };
  if (query.to) where.createdAt = { ...(where.createdAt || {}), [Op.lte]: new Date(query.to) };

  const { count, rows } = await Match.findAndCountAll({
    where,
    include: [
      { model: User, as: 'winner', attributes: ['id', 'username', 'avatarUrl'] },
      { model: MatchPlayer, attributes: ['id', 'userId', 'position', 'status'] },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return { matches: rows, meta: getPageMeta(count, page, limit) };
};

const getMatchById = async (id) => {
  const match = await Match.findByPk(id, {
    include: [
      { model: User, as: 'winner', attributes: ['id', 'username', 'avatarUrl'] },
      {
        model: MatchPlayer,
        include: [{ model: User, attributes: ['id', 'username', 'avatarUrl', 'level'] }],
      },
    ],
  });
  if (!match) throw new AppError('\u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629', 404);
  return match;
};

module.exports = { listMatches, getMatchById };
