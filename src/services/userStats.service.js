const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function getUserStats(userId) {
  const [row] = await sequelize.query(`
    SELECT
      COUNT(*)::int                                          AS "totalMatches",
      SUM(CASE WHEN m."winnerId" = mp."userId" THEN 1 ELSE 0 END)::int AS "wins",
      SUM(CASE WHEN m."winnerId" IS NOT NULL AND m."winnerId" != mp."userId" THEN 1 ELSE 0 END)::int AS "losses",
      SUM(CASE WHEN m."winnerId" = mp."userId" AND m."mode" = '1v1' THEN 1 ELSE 0 END)::int        AS "wins1v1",
      SUM(CASE WHEN m."winnerId" = mp."userId" AND m."mode" = '4player' THEN 1 ELSE 0 END)::int    AS "wins4player",
      SUM(mp."attacksLanded")::int                           AS "totalKills",
      SUM(mp."correctAnswers")::int                          AS "totalCorrectAnswers"
    FROM "MatchPlayers" mp
    JOIN "Matches" m ON m.id = mp."matchId"
    WHERE mp."userId" = :userId
      AND m."status" = 'finished'
  `, {
    replacements: { userId },
    type: QueryTypes.SELECT,
  });

  const totalMatches = row.totalMatches || 0;
  const wins = row.wins || 0;
  const losses = row.losses || 0;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Current win streak: count consecutive recent wins
  const recentMatches = await sequelize.query(`
    SELECT (m."winnerId" = mp."userId") AS "isWin"
    FROM "MatchPlayers" mp
    JOIN "Matches" m ON m.id = mp."matchId"
    WHERE mp."userId" = :userId
      AND m."status" = 'finished'
    ORDER BY m."endedAt" DESC
  `, {
    replacements: { userId },
    type: QueryTypes.SELECT,
  });

  let currentStreak = 0;
  for (const match of recentMatches) {
    if (match.isWin) currentStreak++;
    else break;
  }

  return {
    totalMatches,
    wins,
    losses,
    winRate,
    currentStreak,
    wins1v1: row.wins1v1 || 0,
    wins4player: row.wins4player || 0,
    totalKills: row.totalKills || 0,
    totalCorrectAnswers: row.totalCorrectAnswers || 0,
  };
}

module.exports = { getUserStats };
