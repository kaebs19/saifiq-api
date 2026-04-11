const { initSocketServer } = require('../socket');

const initSocket = (io) => {
  initSocketServer(io);
};

module.exports = { initSocket };
