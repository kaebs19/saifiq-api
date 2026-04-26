const matchEngine = require('../../services/matchEngine.service');
const castleSiege = require('../../services/castleSiege.service');
const { MatchPlayer, Match, sequelize } = require('../../models');
const { emitToUser } = require('../connectionManager');

// Track which matches have started + per-mode flag
const startedMatches = new Set();
const matchModeCache = new Map(); // matchId → mode
const readyByMatch = new Map(); // matchId → Set<userId>

// Per-match question timer (so we can cancel when all answer early)
const questionTimers = new Map(); // matchId → Timeout
// Per-match resolve guard (prevents double-resolve from race)
const resolveGuard = new Set(); // matchId:phase:index strings

// Rematch: matchId → Set<userId who accepted>
const rematchRequests = new Map();

const isCastleSiege = (mode) => mode === '1v1';

// ════════════════════════════════════════════
//  CASTLE SIEGE FLOW (1v1)
// ════════════════════════════════════════════

const sendCSQuestion = async (io, matchId) => {
  const payload = await castleSiege.getQuestionPayload(matchId);
  if (!payload) return;
  io.to(`match:${matchId}`).emit('match:question', payload);

  // Cancel any leftover timer
  if (questionTimers.has(matchId)) clearTimeout(questionTimers.get(matchId));

  // Auto-end question when full timeLimit elapses (always — even if all answered early)
  // We schedule at full duration; early-completion is handled separately via short delay
  const t = setTimeout(() => resolveCSQuestion(io, matchId, 'timeout'), castleSiege.QUESTION_TIME_MS + 500);
  questionTimers.set(matchId, t);
};

const resolveCSQuestion = async (io, matchId, source = 'timeout') => {
  const state = await castleSiege.loadState(matchId);
  if (!state || state.phase === 'ended') return;

  // Idempotency guard — prevent double-resolve race between early-trigger + timer
  const guardKey = `${matchId}:${state.phase}:${state.currentIndex}`;
  if (resolveGuard.has(guardKey)) return;
  resolveGuard.add(guardKey);

  // Cancel pending timer (if early-resolved by allAnswered)
  if (questionTimers.has(matchId)) {
    clearTimeout(questionTimers.get(matchId));
    questionTimers.delete(matchId);
  }

  // Mark unanswered as wrong (timeout case only)
  for (const id of state.playerIds) {
    if (!state.players[id].answered) {
      await castleSiege.submitAnswer(matchId, id, '', castleSiege.QUESTION_TIME_MS);
    }
  }

  const result = await castleSiege.resolveQuestion(matchId);
  if (!result) return;

  // Broadcast each player's result
  for (const r of result.results) {
    io.to(`match:${matchId}`).emit('match:answer-submitted', {
      matchId,
      questionId: result.questionId,
      ...r,
    });
  }

  // Battle attacks
  if (result.attack?.events?.length) {
    for (const ev of result.attack.events) {
      io.to(`match:${matchId}`).emit('match:attack', { matchId, ...ev });
    }
  }

  // Eliminations — ONLY in battle phase, never in collection (HP doesn't apply yet)
  if (result.phase === 'battle') {
    for (const uid of result.eliminated) {
      io.to(`match:${matchId}`).emit('match:eliminated', { matchId, userId: uid });
    }
  }

  // If battle ended by elimination → finalize after gap
  if (result.battleOver) {
    setTimeout(async () => {
      const updated = await castleSiege.loadState(matchId);
      const winnerId = updated?.playerIds.find((id) => updated.players[id].hp > 0) || null;
      const summary = await castleSiege.finalize(matchId, winnerId);
      if (summary) io.to(`match:${matchId}`).emit('match:ended', summary);
      cleanup(matchId);
    }, castleSiege.QUESTION_GAP_MS);
    return;
  }

  // Otherwise wait QUESTION_GAP_MS (2.5s) so players see the result/attack, then next
  setTimeout(() => advanceCS(io, matchId), castleSiege.QUESTION_GAP_MS);
};

const advanceCS = async (io, matchId) => {
  const step = await castleSiege.advance(matchId);
  if (!step) return;

  if (step.kind === 'next-question') {
    await sendCSQuestion(io, matchId);
    return;
  }

  if (step.kind === 'phase-transition') {
    io.to(`match:${matchId}`).emit('match:phase-result', {
      matchId,
      phase: 'collection',
      powers: step.powers,
      nextPhase: 'battle',
    });

    setTimeout(() => {
      io.to(`match:${matchId}`).emit('match:phase', { matchId, phase: 'battle' });
      setTimeout(() => sendCSQuestion(io, matchId), 500);
    }, castleSiege.PHASE_TRANSITION_MS);
    return;
  }

  if (step.kind === 'battle-end') {
    const summary = await castleSiege.finalize(matchId, step.winnerId);
    if (summary) io.to(`match:${matchId}`).emit('match:ended', summary);
    cleanup(matchId);
  }
};

const cleanup = (matchId) => {
  startedMatches.delete(matchId);
  readyByMatch.delete(matchId);
  matchModeCache.delete(matchId);
  if (questionTimers.has(matchId)) {
    clearTimeout(questionTimers.get(matchId));
    questionTimers.delete(matchId);
  }
  // Drop any guard keys for this match
  for (const k of Array.from(resolveGuard)) {
    if (k.startsWith(`${matchId}:`)) resolveGuard.delete(k);
  }
};

// ════════════════════════════════════════════
//  CLASSIC MCQ FLOW (4player)
// ════════════════════════════════════════════

const broadcastMCQQuestion = async (io, matchId) => {
  const data = await matchEngine.getSpecQuestion(matchId);
  if (!data) return;
  const { correctIndex, ...payload } = data;
  io.to(`match:${matchId}`).emit('match:question', payload);

  setTimeout(() => advanceMCQ(io, matchId), matchEngine.QUESTION_TIME_MS + 2000);
};

const advanceMCQ = async (io, matchId) => {
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
    cleanup(matchId);
    return;
  }

  await broadcastMCQQuestion(io, matchId);
};

// ════════════════════════════════════════════
//  HANDLERS
// ════════════════════════════════════════════

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

      if (!readyByMatch.has(matchId)) readyByMatch.set(matchId, new Set());
      readyByMatch.get(matchId).add(userId);

      io.to(`match:${matchId}`).emit('match:player-joined', { userId });

      const totalPlayers = await MatchPlayer.count({ where: { matchId } });
      if (readyByMatch.get(matchId).size >= totalPlayers && !startedMatches.has(matchId)) {
        startedMatches.add(matchId);

        const match = await Match.findByPk(matchId, { attributes: ['mode'] });
        const mode = match?.mode || '1v1';
        matchModeCache.set(matchId, mode);

        if (isCastleSiege(mode)) {
          // Castle Siege flow
          await castleSiege.initMatch(matchId);
          io.to(`match:${matchId}`).emit('match:started', {
            matchId,
            startedAt: new Date().toISOString(),
          });
          // Per spec: match:started → first question = 0.5s
          io.to(`match:${matchId}`).emit('match:phase', { matchId, phase: 'collection' });
          setTimeout(() => sendCSQuestion(io, matchId), 500);
        } else {
          // Classic MCQ flow (4-player)
          await matchEngine.startMatch(matchId);
          io.to(`match:${matchId}`).emit('match:started', {
            matchId,
            startedAt: new Date().toISOString(),
          });
          setTimeout(() => broadcastMCQQuestion(io, matchId), 1000);
        }
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('match:answer', async ({ matchId, answer, timeMs }, ack) => {
    try {
      const mode = matchModeCache.get(matchId);

      if (isCastleSiege(mode)) {
        const result = await castleSiege.submitAnswer(matchId, userId, answer, timeMs);
        ack?.({ ok: result.ok });
        if (result.ok && result.allAnswered) {
          // All players answered — resolve after a short delay so the last
          // submitter sees their own UI react. Timer cancellation + guard
          // ensure we don't double-resolve with the timeLimit fallback.
          setTimeout(() => resolveCSQuestion(io, matchId, 'all-answered'), 800);
        }
        return;
      }

      // Classic MCQ
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

      if (result.eliminated?.length) {
        result.eliminated.forEach((uid) => {
          io.to(`match:${matchId}`).emit('match:eliminated', { matchId, userId: uid });
        });
      }

      const state = await matchEngine.loadState(matchId);
      if (state && matchEngine.allAnswered(state)) {
        setTimeout(() => advanceMCQ(io, matchId), 1000);
      }
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  // ── Rematch ──
  socket.on('match:rematch', async ({ matchId }, ack) => {
    try {
      const player = await MatchPlayer.findOne({ where: { matchId, userId } });
      if (!player) {
        ack?.({ ok: false, error: 'Not in this match' });
        return;
      }

      const set = rematchRequests.get(matchId) || new Set();
      set.add(userId);
      rematchRequests.set(matchId, set);

      const allPlayers = await MatchPlayer.findAll({ where: { matchId }, attributes: ['userId'] });
      allPlayers
        .filter((p) => p.userId !== userId)
        .forEach((p) => emitToUser(p.userId, 'match:rematch-requested', { matchId, fromUserId: userId }));

      ack?.({ ok: true, acceptedCount: set.size, required: allPlayers.length });

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
      // Items only in classic MCQ mode
      const mode = matchModeCache.get(matchId);
      if (isCastleSiege(mode)) {
        ack?.({ ok: false, error: 'Items not available in Castle Siege' });
        return;
      }

      const result = await matchEngine.useItem(matchId, userId, itemType);
      ack?.({ ok: true, ...result });

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
