const { ClanMember } = require('../../models');

const clanRoom = (clanId) => `clan:${clanId}`;

const registerClanHandlers = (io, socket) => {
  const userId = socket.user.id;

  socket.on('clan:join', async ({ clanId }, ack) => {
    try {
      const member = await ClanMember.findOne({ where: { clanId, userId } });
      if (!member) {
        ack?.({ ok: false, error: 'not a member' });
        return;
      }
      socket.join(clanRoom(clanId));
      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('clan:leave', ({ clanId }, ack) => {
    socket.leave(clanRoom(clanId));
    ack?.({ ok: true });
  });

  socket.on('clan:typing', ({ clanId }) => {
    socket.to(clanRoom(clanId)).emit('clan:typing', {
      clanId,
      userId,
      username: socket.user.username,
    });
  });
};

module.exports = { registerClanHandlers, clanRoom };
