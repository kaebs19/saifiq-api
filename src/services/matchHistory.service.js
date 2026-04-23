const { Match, MatchPlayer, User, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

const getHistory = async (userId, limit = 50) => {
  const lim = Math.min(parseInt(limit) || 50, 100);

  // Get finished matches the user played in
  const myMatches = await MatchPlayer.findAll({
    where: { userId },
    include: [{
      model: Match,
      where: { status: 'finished' },
      required: true,
    }],
    order: [[Match, 'endedAt', 'DESC']],
    limit: lim,
  });

  if (!myMatches.length) return [];

  const matchIds = myMatches.map((mp) => mp.matchId);

  // Fetch all players for all matches in one query
  const allPlayers = await MatchPlayer.findAll({
    where: { matchId: { [Op.in]: matchIds } },
    include: [{ model: User, attributes: ['id', 'username', 'avatarUrl'] }],
  });

  // Fetch win_reward transactions for gold earned
  const txs = await Transaction.findAll({
    where: {
      userId,
      matchId: { [Op.in]: matchIds },
      type: 'win_reward',
    },
    attributes: ['matchId', 'amount'],
  });
  const goldByMatch = {};
  txs.forEach((t) => { goldByMatch[t.matchId] = (goldByMatch[t.matchId] || 0) + t.amount; });

  return myMatches.map((mp) => {
    const match = mp.Match;
    const didIWin = match.winnerId === userId;
    const myScore = mp.phase1Score || 0;

    // Find best opponent (highest score non-me player)
    const players = allPlayers.filter((p) => p.matchId === mp.matchId && p.userId !== userId);
    const opponent = players.sort((a, b) => (b.phase1Score || 0) - (a.phase1Score || 0))[0];

    return {
      id: match.id,
      mode: match.mode,
      didIWin,
      myScore,
      opponentName: opponent?.User?.username || '—',
      opponentAvatar: opponent?.User?.avatarUrl || null,
      opponentScore: opponent?.phase1Score || 0,
      goldEarned: goldByMatch[mp.matchId] || 0,
      xpEarned: myScore, // XP ≈ score for now
      playedAt: match.endedAt,
    };
  });
};

module.exports = { getHistory };
