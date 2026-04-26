const matchmakingService = require('../../services/matchmaking.service');
const { emitToUser } = require('../connectionManager');
const { getMatchPlayers } = require('../matchHelpers');

const registerQueueHandlers = (io, socket) => {
  const userId = socket.user.id;

  socket.on('queue:join', async ({ mode }, ack) => {
    try {
      const { position } = await matchmakingService.joinQueue(userId, mode);
      ack?.({ ok: true, position, mode });
      socket.emit('queue:joined', { position, mode });

      const result = await matchmakingService.tryMatchmake(mode);
      if (result) {
        const players = await getMatchPlayers(result.matchId);
        result.players.forEach((uid) => {
          emitToUser(uid, 'match:found', { matchId: result.matchId, mode: result.mode, players });
        });
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
      socket.emit('queue:error', { message: err.message });
    }
  });

  socket.on('queue:leave', async (_, ack) => {
    try {
      await matchmakingService.leaveQueue(userId);
      ack?.({ ok: true });
      socket.emit('queue:left');
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('disconnect', () => {
    matchmakingService.leaveQueue(userId).catch(() => {});
  });
};

module.exports = { registerQueueHandlers };
