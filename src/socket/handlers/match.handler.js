const matchEngine = require('../../services/matchEngine.service');
const { MatchPlayer, Match, sequelize } = require('../../models');
const { emitToUser } = require('../connectionManager');

// Track which matches have started
const startedMatches = new Set();
const readyByMatch = new Map(); // matchId → Set<userId>

// Rematch: matchId → Set<userId who accepted>
const rematchRequests = new Map();

const broadcastQuestion = async (io, matchId) => {
  const data = await matchEngine.getSpecQuestion(matchId);
  if (!data) return;
  // Hide correctIndex from clients
  const { correctIndex, ...payload } = data;
  io.to(`match:${matchId}`).emit('match:question', payload);

  // Auto-advance after timeout
  setTimeout(async () => {
    await advancePhase(io, matchId);
  }, matchEngine.QUESTION_TIME_MS + 2000);
};

const advancePhase = async (io, matchId) => {
  const result = await matchEngine.advanceQuestion(matchId);
  if (!result) return;

  if (result.done) {
    const summary = await matchEngine.endMatch(matchId);
    const winnerScore = summary.winnerId ? (summary.scores[summary.winnerId] || 0) : 0;
    io.to(`match:${matchId}`).emit('match:ended', {
      matchId,
      winnerId: summary.winnerId,
      scores: summary.scores,
      hp: summary.hp,
      rewards: { gold: 50, xp: winnerScore },
    });
    startedMatches.delete(matchId);
    readyByMatch.delete(matchId);
    return;
  }

  // Use spec-compliant broadcast for subsequent questions too
  await broadcastQuestion(io, matchId);
};

const registerMatchHandlers = (io, socket) => {
  const userId = socket.user.id;

  socket.on('match:join', async ({ matchId }, ack) => {
    try {
      const player = await MatchPlayer.findOne({ where: { matchId, userId } });
      if (!player) {
        ack?.({ ok: false, error: 'Not in this match' });
        return;
      }

      socket.join(`match:${matchId}`);
      ack?.({ ok: true });

      // Track ready players
      if (!readyByMatch.has(matchId)) readyByMatch.set(matchId, new Set());
      readyByMatch.get(matchId).add(userId);

      io.to(`match:${matchId}`).emit('match:player-joined', { userId });

      // Check if all players ready
      const totalPlayers = await MatchPlayer.count({ where: { matchId } });
      if (readyByMatch.get(matchId).size >= totalPlayers && !startedMatches.has(matchId)) {
        startedMatches.add(matchId);
        await matchEngine.startMatch(matchId);
        io.to(`match:${matchId}`).emit('match:started', {
          matchId,
          startedAt: new Date().toISOString(),
        });
        setTimeout(() => broadcastQuestion(io, matchId), 1000);
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('match:answer', async ({ matchId, answer, timeMs }, ack) => {
    try {
      const result = await matchEngine.submitAnswer(matchId, userId, answer, timeMs);
      if (!result) {
        ack?.({ ok: false, error: 'Cannot submit answer' });
        return;
      }
      ack?.({ ok: true, correct: result.correct, points: result.points });

      io.to(`match:${matchId}`).emit('match:answer-submitted', {
        matchId,
        questionId: result.questionId,
        userId,
        selectedIndex: result.selectedIndex,
        correct: result.correct,
        correctIndex: result.correctIndex,
        newScore: result.newScore,
        newHP: result.newHP,
        attackTargetId: result.attack?.targetId || null,
        scores: result.scores,
        hp: result.hp,
      });

      if (result.attack?.damage > 0) {
        io.to(`match:${matchId}`).emit('match:attack', {
          matchId,
          attackerId: userId,
          targetId: result.attack.targetId,
          damage: result.attack.damage,
          targetHp: result.attack.targetHp,
        });
      }

      // Emit one event per newly eliminated player
      if (result.eliminated?.length) {
        result.eliminated.forEach((uid) => {
          io.to(`match:${matchId}`).emit('match:eliminated', { matchId, userId: uid });
        });
      }

      const state = await matchEngine.loadState(matchId);
      if (state && matchEngine.allAnswered(state)) {
        setTimeout(() => advancePhase(io, matchId), 1000);
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  // ── Rematch ──
  socket.on('match:rematch', async ({ matchId }, ack) => {
    try {
      // Verify player was in this match
      const player = await MatchPlayer.findOne({ where: { matchId, userId } });
      if (!player) {
        ack?.({ ok: false, error: 'Not in this match' });
        return;
      }

      const set = rematchRequests.get(matchId) || new Set();
      set.add(userId);
      rematchRequests.set(matchId, set);

      // Notify other players someone requested rematch
      const allPlayers = await MatchPlayer.findAll({ where: { matchId }, attributes: ['userId'] });
      allPlayers
        .filter((p) => p.userId !== userId)
        .forEach((p) => emitToUser(p.userId, 'match:rematch-requested', { matchId, fromUserId: userId }));

      ack?.({ ok: true, acceptedCount: set.size, required: allPlayers.length });

      // If all accepted → create new match
      if (set.size >= allPlayers.length) {
        const playerIds = allPlayers.map((p) => p.userId);
        const oldMatch = await Match.findByPk(matchId, { attributes: ['mode'] });

        const newMatch = await sequelize.transaction(async (t) => {
          const m = await Match.create({ mode: oldMatch.mode, status: 'waiting' }, { transaction: t });
          await Promise.all(
            playerIds.map((uid, idx) =>
              MatchPlayer.create({
                matchId: m.id,
                userId: uid,
                position: idx + 1,
                status: 'active',
              }, { transaction: t })
            )
          );
          return m;
        });

        playerIds.forEach((uid) =>
          emitToUser(uid, 'match:rematch-accepted', { matchId, newMatchId: newMatch.id })
        );

        rematchRequests.delete(matchId);
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('match:use-item', async ({ matchId, itemType }, ack) => {
    try {
      const result = await matchEngine.useItem(matchId, userId, itemType);
      ack?.({ ok: true, ...result });

      // Broadcast to the user only (personal effects) or room (public effects)
      if (result.effect === 'shield_added') {
        io.to(`match:${matchId}`).emit('match:item-used', { userId, itemType, effect: result.effect });
      } else {
        socket.emit('match:item-effect', result);
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });
};

module.exports = { registerMatchHandlers };
