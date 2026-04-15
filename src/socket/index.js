const { socketAuth } = require('./auth.middleware');
const { setIo, registerUser, removeUser, getOnlineCount } = require('./connectionManager');
const { registerQueueHandlers } = require('./handlers/queue.handler');
const { registerMatchHandlers } = require('./handlers/match.handler');
const { registerRoomHandlers } = require('./handlers/room.handler');
const { registerClanHandlers } = require('./handlers/clan.handler');

const initSocketServer = (io) => {
  setIo(io);
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const { id: userId, username } = socket.user;
    registerUser(userId, socket.id);
    console.log(`✅ ${username} connected (online: ${getOnlineCount()})`);

    socket.emit('connected', { userId, username });

    registerQueueHandlers(io, socket);
    registerMatchHandlers(io, socket);
    registerRoomHandlers(io, socket);
    registerClanHandlers(io, socket);

    socket.on('disconnect', () => {
      removeUser(userId, socket.id);
      console.log(`❌ ${username} disconnected (online: ${getOnlineCount()})`);
    });
  });
};

module.exports = { initSocketServer };
