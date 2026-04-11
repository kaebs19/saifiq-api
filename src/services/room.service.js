const { redis } = require('../config/redis');
const { Match, MatchPlayer, User, sequelize } = require('../models');
const { GAME_MODES } = require('../config/constants');

const ROOM_KEY = (code) => `room:${code}`;
const PLAYER_ROOM_KEY = (userId) => `player:${userId}:room`;
const ROOM_TTL = 600; // 10 minutes

const REQUIRED = {
  [GAME_MODES.ONE_V_ONE]: 2,
  [GAME_MODES.FOUR_PLAYER]: 4,
};

// ── Generate unique 6-digit code ──

const generateCode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = String(100000 + Math.floor(Math.random() * 900000));
    const exists = await redis.exists(ROOM_KEY(code));
    if (!exists) return code;
  }
  throw new Error('تعذر توليد كود فريد، حاول مرة أخرى');
};

// ── Create Room ──

const createRoom = async (hostId, mode) => {
  if (!REQUIRED[mode]) throw new Error('نمط لعب غير صالح');

  // Leave any existing room first
  await leaveRoom(hostId);

  const code = await generateCode();
  const host = await User.findByPk(hostId, { attributes: ['id', 'username', 'avatarUrl'] });

  const room = {
    code,
    hostId,
    mode,
    players: [{ id: host.id, username: host.username, avatarUrl: host.avatarUrl }],
    createdAt: Date.now(),
  };

  await redis.set(ROOM_KEY(code), JSON.stringify(room), 'EX', ROOM_TTL);
  await redis.set(PLAYER_ROOM_KEY(hostId), code, 'EX', ROOM_TTL);

  return room;
};

// ── Join Room ──

const joinRoom = async (userId, code) => {
  const raw = await redis.get(ROOM_KEY(code));
  if (!raw) throw new Error('الغرفة غير موجودة أو انتهت');

  const room = JSON.parse(raw);
  const required = REQUIRED[room.mode];

  if (room.players.length >= required) throw new Error('الغرفة مكتملة');
  if (room.players.some((p) => p.id === userId)) throw new Error('أنت في الغرفة بالفعل');

  // Leave any existing room
  await leaveRoom(userId);

  const user = await User.findByPk(userId, { attributes: ['id', 'username', 'avatarUrl'] });
  room.players.push({ id: user.id, username: user.username, avatarUrl: user.avatarUrl });

  await redis.set(ROOM_KEY(code), JSON.stringify(room), 'EX', ROOM_TTL);
  await redis.set(PLAYER_ROOM_KEY(userId), code, 'EX', ROOM_TTL);

  return room;
};

// ── Leave Room ──

const leaveRoom = async (userId) => {
  const code = await redis.get(PLAYER_ROOM_KEY(userId));
  if (!code) return null;

  const raw = await redis.get(ROOM_KEY(code));
  if (!raw) {
    await redis.del(PLAYER_ROOM_KEY(userId));
    return null;
  }

  const room = JSON.parse(raw);

  // If host leaves, disband the room
  if (room.hostId === userId) {
    await disbandRoom(room);
    return { disbanded: true, code, players: room.players };
  }

  // Remove player
  room.players = room.players.filter((p) => p.id !== userId);
  await redis.set(ROOM_KEY(code), JSON.stringify(room), 'EX', ROOM_TTL);
  await redis.del(PLAYER_ROOM_KEY(userId));

  return { disbanded: false, code, room };
};

// ── Disband Room ──

const disbandRoom = async (room) => {
  await redis.del(ROOM_KEY(room.code));
  await Promise.all(room.players.map((p) => redis.del(PLAYER_ROOM_KEY(p.id))));
};

// ── Check if room is full & start match ──

const tryStartMatch = async (code) => {
  const raw = await redis.get(ROOM_KEY(code));
  if (!raw) return null;

  const room = JSON.parse(raw);
  const required = REQUIRED[room.mode];

  if (room.players.length < required) return null;

  // Create match in DB (same as matchmaking.tryMatchmake)
  const playerIds = room.players.map((p) => p.id);

  const match = await sequelize.transaction(async (t) => {
    const m = await Match.create({ mode: room.mode, status: 'waiting' }, { transaction: t });
    await Promise.all(
      playerIds.map((userId, idx) =>
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

  // Clean up room from Redis
  await disbandRoom(room);

  return { matchId: match.id, players: playerIds, mode: room.mode };
};

// ── Get Room ──

const getRoomByCode = async (code) => {
  const raw = await redis.get(ROOM_KEY(code));
  return raw ? JSON.parse(raw) : null;
};

const getRoomByPlayer = async (userId) => {
  const code = await redis.get(PLAYER_ROOM_KEY(userId));
  if (!code) return null;
  return getRoomByCode(code);
};

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  tryStartMatch,
  getRoomByCode,
  getRoomByPlayer,
  REQUIRED,
};
