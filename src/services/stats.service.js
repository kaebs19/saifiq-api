const { Op, fn, col, literal } = require('sequelize');
const { User, Match, Transaction, Question, sequelize } = require('../models');
const { ROLES } = require('../config/constants');

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getOverview = async () => {
  const today = startOfToday();

  const [
    totalPlayers,
    activePlayers,
    totalMatches,
    matchesToday,
    finishedToday,
    gemsPurchased,
    gemsDistributedToday,
    totalQuestions,
    activeQuestions,
  ] = await Promise.all([
    User.count({ where: { role: ROLES.PLAYER } }),
    User.count({ where: { role: ROLES.PLAYER, isBanned: false } }),
    Match.count(),
    Match.count({ where: { createdAt: { [Op.gte]: today } } }),
    Match.count({ where: { status: 'finished', endedAt: { [Op.gte]: today } } }),
    Transaction.sum('amount', { where: { type: 'purchase' } }),
    Transaction.sum('amount', { where: { type: 'win_reward', createdAt: { [Op.gte]: today } } }),
    Question.count(),
    Question.count({ where: { isActive: true } }),
  ]);

  return {
    totalPlayers,
    activePlayers,
    bannedPlayers: totalPlayers - activePlayers,
    totalMatches,
    matchesToday,
    finishedToday,
    gemsPurchased: gemsPurchased || 0,
    gemsDistributedToday: gemsDistributedToday || 0,
    totalQuestions,
    activeQuestions,
  };
};

const getTopPlayers = async (limit = 10) => {
  return User.findAll({
    where: { role: ROLES.PLAYER, isBanned: false },
    attributes: ['id', 'username', 'avatarUrl', 'country', 'level', 'gems', 'gold', 'wins', 'losses', 'totalPoints'],
    order: [['totalPoints', 'DESC'], ['wins', 'DESC']],
    limit,
  });
};

const getDailyChart = async (days = 7) => {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  // Matches per day
  const matchRows = await Match.findAll({
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('COUNT', col('id')), 'count'],
    ],
    where: { createdAt: { [Op.gte]: from } },
    group: [literal('DATE("createdAt")')],
    order: [[literal('DATE("createdAt")'), 'ASC']],
    raw: true,
  });

  // Gems distributed per day (win_reward)
  const gemRows = await Transaction.findAll({
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('SUM', col('amount')), 'total'],
    ],
    where: { type: 'win_reward', createdAt: { [Op.gte]: from } },
    group: [literal('DATE("createdAt")')],
    order: [[literal('DATE("createdAt")'), 'ASC']],
    raw: true,
  });

  // Build complete series with zero-fill
  const matchMap = Object.fromEntries(matchRows.map((r) => [r.date, Number(r.count)]));
  const gemMap = Object.fromEntries(gemRows.map((r) => [r.date, Number(r.total)]));

  const series = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    series.push({
      date: key,
      matches: matchMap[key] || 0,
      gems: gemMap[key] || 0,
    });
  }

  return series;
};

module.exports = { getOverview, getTopPlayers, getDailyChart };
