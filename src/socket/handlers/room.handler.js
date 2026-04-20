const { randomUUID } = require('crypto');
const roomService = require('../../services/room.service');
const friendService = require('../../services/friend.service');
const notificationService = require('../../services/notification.service');
const { User } = require('../../models');
const { emitToUser, getSocketsForUser } = require('../connectionManager');

// In-memory ready state per room: code → Set<userId>
const readyState = new Map();

// Rate limit for chat: userId → { count, resetAt }
const chatRateLimit = new Map();
const CHAT_LIMIT_PER_SECOND = 5;

const isChatRateLimited = (userId) => {
  const now = Date.now();
  const entry = chatRateLimit.get(userId);
  if (!entry || now >= entry.resetAt) {
    chatRateLimit.set(userId, { count: 1, resetAt: now + 1000 });
    return false;
  }
  if (entry.count >= CHAT_LIMIT_PER_SECOND) return true;
  entry.count += 1;
  return false;
};

const registerRoomHandlers = (io, socket) => {
  const userId = socket.user.id;

  // ── Create Room ──
  socket.on('room:create', async ({ mode }, ack) => {
    try {
      const room = await roomService.createRoom(userId, mode);

      // Join Socket.IO room for lobby updates
      socket.join(`room:${room.code}`);

      const shareLink = `https://saifiq.halmanhaj.com/join/${room.code}`;
      ack?.({ ok: true, code: room.code, mode: room.mode, players: room.players, shareLink });
      socket.emit('room:created', {
        code: room.code,
        mode: room.mode,
        players: room.players,
        required: roomService.REQUIRED[room.mode],
        shareLink,
      });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
      socket.emit('room:error', { message: err.message });
    }
  });

  // ── Join Room ──
  socket.on('room:join', async ({ code }, ack) => {
    try {
      const room = await roomService.joinRoom(userId, code);
      const required = roomService.REQUIRED[room.mode];

      // Join Socket.IO room
      socket.join(`room:${code}`);

      ack?.({ ok: true, code, mode: room.mode, players: room.players });

      // Broadcast to all in room
      io.to(`room:${code}`).emit('room:player-joined', {
        code,
        player: room.newPlayer,
        players: room.players,
        playerCount: room.players.length,
        required,
      });

      // Check if room is full → auto-start match
      if (room.players.length >= required) {
        const result = await roomService.tryStartMatch(code);
        if (result) {
          // Notify all players — same event as random matchmaking
          result.players.forEach((uid) => {
            emitToUser(uid, 'match:found', { matchId: result.matchId, mode: result.mode });
          });

          // Clean up Socket.IO room
          io.to(`room:${code}`).emit('room:match-starting', { matchId: result.matchId });
          io.in(`room:${code}`).socketsLeave(`room:${code}`);
        }
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
      socket.emit('room:error', { message: err.message });
    }
  });

  // ── Leave Room ──
  socket.on('room:leave', async (_, ack) => {
    try {
      const result = await roomService.leaveRoom(userId);
      if (!result) {
        ack?.({ ok: true });
        return;
      }

      socket.leave(`room:${result.code}`);
      ack?.({ ok: true });

      if (result.disbanded) {
        // Host left — disband and notify everyone
        io.to(`room:${result.code}`).emit('room:disbanded', { code: result.code, reason: 'المضيف غادر الغرفة' });
        io.in(`room:${result.code}`).socketsLeave(`room:${result.code}`);
      } else {
        // Regular player left
        io.to(`room:${result.code}`).emit('room:player-left', {
          code: result.code,
          userId,
          players: result.room.players,
          playerCount: result.room.players.length,
          required: roomService.REQUIRED[result.room.mode],
        });
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  // ── Invite Friend to Room ──
  socket.on('room:invite', async ({ code, friendId }, ack) => {
    try {
      // Verify room exists and inviter is in it
      const room = await roomService.getRoomByCode(code);
      if (!room) throw new Error('الغرفة غير موجودة');
      if (!room.players.some((p) => p.id === userId)) throw new Error('أنت لست في هذه الغرفة');

      // Verify friendship and not blocked
      const blocked = await friendService.isBlocked(userId, friendId);
      if (blocked) throw new Error('لا يمكن دعوة هذا المستخدم');

      const friends = await friendService.areFriends(userId, friendId);
      if (!friends) throw new Error('هذا المستخدم ليس من أصدقائك');

      // Get inviter info
      const inviter = await User.findByPk(userId, { attributes: ['id', 'username', 'avatarUrl'] });

      // Send push + in-app notification
      const modeLabel = room.mode === '1v1' ? 'تحدي 1 ضد 1' : 'تحدي جماعي';
      await notificationService.notify(friendId, {
        title: `${inviter.username} يدعوك للعب!`,
        body: `انضم لـ${modeLabel} الآن`,
        type: 'match_invite',
        data: {
          type: 'room_invite',
          roomCode: code,
          mode: room.mode,
          fromUserId: inviter.id,
          fromUsername: inviter.username,
        },
      });

      // Send real-time event if online
      emitToUser(friendId, 'room:invited', {
        code,
        mode: room.mode,
        fromUser: { id: inviter.id, username: inviter.username, avatarUrl: inviter.avatarUrl },
        inviterName: inviter.username, // backward compat
        shareLink: `https://saifiq.halmanhaj.com/join/${code}`,
      });

      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  // ── Ready Check ──
  socket.on('room:ready', async ({ ready }, ack) => {
    try {
      const room = await roomService.getRoomByPlayer(userId);
      if (!room) throw new Error('أنت لست في غرفة');

      const set = readyState.get(room.code) || new Set();
      if (ready) set.add(userId);
      else set.delete(userId);
      readyState.set(room.code, set);

      ack?.({ ok: true });

      io.to(`room:${room.code}`).emit('room:ready-state', {
        code: room.code,
        readyUserIds: Array.from(set),
      });

      // All ready → auto-start match
      const required = roomService.REQUIRED[room.mode];
      const allReady = room.players.length >= required && room.players.every((p) => set.has(p.id));
      if (allReady) {
        io.to(`room:${room.code}`).emit('room:all-ready', { code: room.code });
        setTimeout(async () => {
          try {
            const result = await roomService.tryStartMatch(room.code);
            if (result) {
              result.players.forEach((uid) => {
                emitToUser(uid, 'match:found', { matchId: result.matchId, mode: result.mode });
              });
              io.to(`room:${room.code}`).emit('room:match-starting', { matchId: result.matchId });
              io.in(`room:${room.code}`).socketsLeave(`room:${room.code}`);
              readyState.delete(room.code);
            }
          } catch (_) {}
        }, 1000);
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
      socket.emit('room:error', { message: err.message });
    }
  });

  // ── Kick Player ──
  socket.on('room:kick', async ({ userId: targetId }, ack) => {
    try {
      const room = await roomService.getRoomByPlayer(userId);
      if (!room) throw new Error('أنت لست في غرفة');
      if (room.hostId !== userId) throw new Error('فقط المضيف يستطيع الطرد');
      if (targetId === userId) throw new Error('لا يمكنك طرد نفسك');
      if (!room.players.some((p) => p.id === targetId)) throw new Error('اللاعب ليس في الغرفة');

      // Remove from room via service (use leaveRoom with the kicked player's ID)
      const result = await roomService.leaveRoom(targetId);
      if (!result) throw new Error('فشل الطرد');

      // Make kicked user's sockets leave the Socket.IO room + notify them
      const kickedSockets = getSocketsForUser(targetId);
      kickedSockets.forEach((sid) => {
        io.sockets.sockets.get(sid)?.leave(`room:${room.code}`);
      });
      emitToUser(targetId, 'room:kicked', { code: room.code, reason: 'تم طردك من الغرفة' });

      // Clean ready state
      const set = readyState.get(room.code);
      if (set) set.delete(targetId);

      ack?.({ ok: true });

      // Broadcast updated player list
      io.to(`room:${room.code}`).emit('room:player-left', {
        code: room.code,
        userId: targetId,
        players: result.room?.players || [],
        playerCount: result.room?.players?.length || 0,
        required: roomService.REQUIRED[room.mode],
      });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
      socket.emit('room:error', { message: err.message });
    }
  });

  // ── Room Chat ──
  socket.on('room:chat-message', async ({ content }, ack) => {
    try {
      if (!content || !content.trim()) return;
      if (isChatRateLimited(userId)) {
        ack?.({ ok: false, error: 'الرجاء التمهل' });
        return;
      }

      const room = await roomService.getRoomByPlayer(userId);
      if (!room) throw new Error('أنت لست في غرفة');
      if (!room.players.some((p) => p.id === userId)) throw new Error('أنت لست في الغرفة');

      const trimmed = content.trim().slice(0, 200);
      const user = await User.findByPk(userId, { attributes: ['id', 'username', 'avatarUrl'] });

      const message = {
        id: randomUUID(),
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      ack?.({ ok: true });
      io.to(`room:${room.code}`).emit('room:chat-message', { code: room.code, message });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  // ── Disconnect cleanup ──
  socket.on('disconnect', () => {
    handleDisconnect(io, userId);
    // Clean from all ready sets
    for (const set of readyState.values()) set.delete(userId);
    chatRateLimit.delete(userId);
  });
};

const handleDisconnect = async (io, userId) => {
  try {
    const result = await roomService.leaveRoom(userId);
    if (!result) return;

    if (result.disbanded) {
      io.to(`room:${result.code}`).emit('room:disbanded', { code: result.code, reason: 'المضيف انقطع الاتصال' });
      io.in(`room:${result.code}`).socketsLeave(`room:${result.code}`);
    } else {
      io.to(`room:${result.code}`).emit('room:player-left', {
        code: result.code,
        userId,
        players: result.room.players,
        playerCount: result.room.players.length,
        required: roomService.REQUIRED[result.room.mode],
      });
    }
  } catch (err) {
    // Silent fail on disconnect cleanup
  }
};

module.exports = { registerRoomHandlers };
