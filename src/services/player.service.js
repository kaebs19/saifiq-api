const { Op } = require('sequelize');
const { User, Transaction, Match, MatchPlayer, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, getPageMeta } = require('../utils/pagination');
const { ROLES } = require('../config/constants');

const PLAYER_ATTRS = [
  'id', 'username', 'email', 'avatarUrl', 'country',
  'level', 'gems', 'wins', 'losses', 'totalPoints', 'weeklyPoints',
  'isBanned', 'role', 'createdAt',
];

const getPlayers = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = { role: ROLES.PLAYER };

  if (query.search) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${query.search}%` } },
      { email: { [Op.iLike]: `%${query.search}%` } },
    ];
  }
  if (query.country) where.country = query.country;
  if (query.isBanned !== undefined && query.isBanned !== '') {
    where.isBanned = query.isBanned === 'true';
  }

  const sort = query.sort || 'createdAt';
  const order = query.order === 'asc' ? 'ASC' : 'DESC';

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: PLAYER_ATTRS,
    order: [[sort, order]],
    limit,
    offset,
  });

  return { players: rows, meta: getPageMeta(count, page, limit) };
};

const getPlayerById = async (id) => {
  const player = await User.findOne({
    where: { id, role: ROLES.PLAYER },
    attributes: PLAYER_ATTRS,
  });
  if (!player) throw new AppError('\u0627\u0644\u0644\u0627\u0639\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F', 404);
  return player;
};

const updateGems = async (id, { gems, reason }) => {
  const player = await getPlayerById(id);
  const diff = gems - player.gems;

  return sequelize.transaction(async (t) => {
    await User.update({ gems }, { where: { id }, transaction: t });
    if (diff !== 0) {
      await Transaction.create({
        userId: id,
        amount: diff,
        type: diff > 0 ? 'win_reward' : 'item_use',
        description: reason || `\u062A\u0639\u062F\u064A\u0644 \u0645\u0646 \u0627\u0644\u0623\u062F\u0645\u0646`,
      }, { transaction: t });
    }
    const updated = await User.findByPk(id, { attributes: PLAYER_ATTRS, transaction: t });
    return updated;
  });
};

const setBanStatus = async (id, isBanned) => {
  const player = await getPlayerById(id);
  await User.update({ isBanned }, { where: { id } });
  return { ...player.toJSON(), isBanned };
};

const getPlayerMatches = async (playerId, query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await MatchPlayer.findAndCountAll({
    where: { userId: playerId },
    include: [{
      model: Match,
      include: [{ model: User, as: 'winner', attributes: ['id', 'username'] }],
    }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return { matches: rows, meta: getPageMeta(count, page, limit) };
};

const getPlayerTransactions = async (playerId, query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Transaction.findAndCountAll({
    where: { userId: playerId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return { transactions: rows, meta: getPageMeta(count, page, limit) };
};

module.exports = { getPlayers, getPlayerById, updateGems, setBanStatus, getPlayerMatches, getPlayerTransactions };
