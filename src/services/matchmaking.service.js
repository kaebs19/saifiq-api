const { redis } = require('../config/redis');
const { Match, MatchPlayer, sequelize } = require('../models');
const { GAME_MODES } = require('../config/constants');
const AppError = require('../utils/AppError');

const QUEUE_KEY = (mode) => `queue:${mode}`;
const PLAYER_QUEUE_KEY = (userId) => `player:${userId}:queue`;

const REQUIRED = {
  [GAME_MODES.ONE_V_ONE]: 2,
  [GAME_MODES.FOUR_PLAYER]: 4,
};

const joinQueue = async (userId, mode) => {
  if (!REQUIRED[mode]) throw new AppError('\u0646\u0645\u0637 \u0644\u0639\u0628 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D', 400);

  // Remove from any other queue first
  await leaveQueue(userId);

  await redis.zadd(QUEUE_KEY(mode), Date.now(), userId);
  await redis.set(PLAYER_QUEUE_KEY(userId), mode, 'EX', 600);

  const position = await redis.zrank(QUEUE_KEY(mode), userId);
  return { position: position + 1, mode };
};

const leaveQueue = async (userId) => {
  const mode = await redis.get(PLAYER_QUEUE_KEY(userId));
  if (mode) {
    await redis.zrem(QUEUE_KEY(mode), userId);
    await redis.del(PLAYER_QUEUE_KEY(userId));
  }
};

const tryMatchmake = async (mode) => {
  const required = REQUIRED[mode];
  if (!required) return null;

  const queueSize = await redis.zcard(QUEUE_KEY(mode));
  if (queueSize < required) return null;

  // Atomically pop the oldest N players
  const players = await redis.zrange(QUEUE_KEY(mode), 0, required - 1);
  if (players.length < required) return null;

  await redis.zrem(QUEUE_KEY(mode), ...players);
  await Promise.all(players.map((uid) => redis.del(PLAYER_QUEUE_KEY(uid))));

  // Create the match in DB
  const match = await sequelize.transaction(async (t) => {
    const m = await Match.create({ mode, status: 'waiting' }, { transaction: t });
    await Promise.all(
      players.map((userId, idx) =>
        MatchPlayer.create({
          matchId: m.id,
          userId,
          position: idx + 1,
          status: 'active',
        }, { transaction: t })
      )
    );
    return m;
  });

  return { matchId: match.id, players, mode };
};

module.exports = { joinQueue, leaveQueue, tryMatchmake, REQUIRED };
