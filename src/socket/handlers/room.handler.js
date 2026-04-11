const roomService = require('../../services/room.service');
const friendService = require('../../services/friend.service');
const notificationService = require('../../services/notification.service');
const { User } = require('../../models');
const { emitToUser } = require('../connectionManager');

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
        io.to(`room:${result.code}`).emit('room:disbanded', { reason: 'المضيف غادر الغرفة' });
        io.in(`room:${result.code}`).socketsLeave(`room:${result.code}`);
      } else {
        // Regular player left
        io.to(`room:${result.code}`).emit('room:player-left', {
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
      const inviter = await User.findByPk(userId, { attributes: ['username'] });

      // Send push + in-app notification
      const modeLabel = room.mode === '1v1' ? 'تحدي 1 ضد 1' : 'تحدي جماعي';
      await notificationService.notify(friendId, {
        title: 'دعوة للتحدي',
        body: `${inviter.username} يدعوك لـ${modeLabel}`,
        type: 'match_invite',
        data: { roomCode: code, inviterId: userId, mode: room.mode },
      });

      // Send real-time event if online
      emitToUser(friendId, 'room:invited', {
        code,
        mode: room.mode,
        inviterName: inviter.username,
        shareLink: `https://saifiq.halmanhaj.com/join/${code}`,
      });

      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  // ── Disconnect cleanup ──
  socket.on('disconnect', () => {
    handleDisconnect(io, userId);
  });
};

const handleDisconnect = async (io, userId) => {
  try {
    const result = await roomService.leaveRoom(userId);
    if (!result) return;

    if (result.disbanded) {
      io.to(`room:${result.code}`).emit('room:disbanded', { reason: 'المضيف انقطع الاتصال' });
      io.in(`room:${result.code}`).socketsLeave(`room:${result.code}`);
    } else {
      io.to(`room:${result.code}`).emit('room:player-left', {
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
