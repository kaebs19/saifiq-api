const jwt = require('jsonwebtoken');
const { User } = require('../models');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'role', 'isBanned'],
    });

    if (!user) return next(new Error('User not found'));
    if (user.isBanned) return next(new Error('Account is banned'));

    socket.user = { id: user.id, username: user.username, role: user.role };
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
};

module.exports = { socketAuth };
