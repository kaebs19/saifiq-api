const { Op } = require('sequelize');
const { User, Friendship } = require('../models');
const { ROLES } = require('../config/constants');

const LEADERBOARD_ATTRS = ['id', 'username', 'avatarUrl', 'country', 'level', 'totalPoints', 'weeklyPoints', 'wins'];

const getTopAllTime = async (limit = 50) => {
  const players = await User.findAll({
    where: { role: ROLES.PLAYER, isBanned: false },
    attributes: LEADERBOARD_ATTRS,
    order: [['totalPoints', 'DESC'], ['wins', 'DESC']],
    limit,
  });

  return players.map((p, i) => ({ rank: i + 1, ...p.toJSON() }));
};

const getTopWeekly = async (limit = 50) => {
  const players = await User.findAll({
    where: { role: ROLES.PLAYER, isBanned: false },
    attributes: LEADERBOARD_ATTRS,
    order: [['weeklyPoints', 'DESC'], ['wins', 'DESC']],
    limit,
  });

  return players.map((p, i) => ({ rank: i + 1, ...p.toJSON() }));
};

const getTopFriends = async (userId, limit = 50) => {
  const friendships = await Friendship.findAll({
    where: {
      status: 'accepted',
      [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
    },
    attributes: ['requesterId', 'addresseeId'],
  });

  const friendIds = friendships.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId,
  );
  friendIds.push(userId);

  const players = await User.findAll({
    where: { id: { [Op.in]: friendIds }, role: ROLES.PLAYER, isBanned: false },
    attributes: LEADERBOARD_ATTRS,
    order: [['totalPoints', 'DESC'], ['wins', 'DESC']],
    limit,
  });

  const ranked = players.map((p, i) => ({ rank: i + 1, ...p.toJSON() }));
  const myRank = ranked.find((p) => p.id === userId)?.rank || null;

  return { players: ranked, myRank };
};

module.exports = { getTopAllTime, getTopWeekly, getTopFriends };
