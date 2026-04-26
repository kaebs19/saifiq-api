const { User, MatchPlayer } = require('../models');

/**
 * Fetch player profiles for a match (id, username, avatarUrl, level).
 * Used to enrich `match:found` payloads.
 */
const getMatchPlayers = async (matchId) => {
  const rows = await MatchPlayer.findAll({
    where: { matchId },
    include: [{ model: User, attributes: ['id', 'username', 'avatarUrl', 'level'] }],
  });
  return rows
    .map((r) => r.User)
    .filter(Boolean)
    .map((u) => ({ id: u.id, username: u.username, avatarUrl: u.avatarUrl, level: u.level }));
};

module.exports = { getMatchPlayers };
