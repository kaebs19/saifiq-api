// In-memory map: userId → Set<socketId>
const userSockets = new Map();
let ioInstance = null;

const setIo = (io) => { ioInstance = io; };
const getIo = () => ioInstance;

const registerUser = (userId, socketId) => {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socketId);
};

const removeUser = (userId, socketId) => {
  const set = userSockets.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) userSockets.delete(userId);
};

const getSocketsForUser = (userId) => {
  return Array.from(userSockets.get(userId) || []);
};

const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;
  const socketIds = getSocketsForUser(userId);
  socketIds.forEach((sid) => ioInstance.to(sid).emit(event, payload));
};

const isOnline = (userId) => userSockets.has(userId);

const getOnlineCount = () => userSockets.size;

module.exports = {
  setIo,
  getIo,
  registerUser,
  removeUser,
  getSocketsForUser,
  emitToUser,
  isOnline,
  getOnlineCount,
};
