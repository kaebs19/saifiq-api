/**
 * Castle Siege — 1v1 match engine with 2 phases:
 *   Phase 1 (collection): 4 input questions, accumulate "power"
 *   Phase 2 (battle): 10 input questions, fastest correct deals 1 damage
 *
 * State stored in Redis under cs:<matchId>
 */
const { Op } = require('sequelize');
const { Match, MatchPlayer, Question, User, Transaction, sequelize } = require('../models');
const { redis } = require('../config/redis');

const STATE_KEY = (matchId) => `cs:${matchId}:state`;
const STATE_TTL = 3600;
const COLLECTION_COUNT = 4;
const BATTLE_COUNT = 10;
const QUESTION_TIME_MS = 15000;
const STARTING_POWER = 2;
const PHASE_TRANSITION_MS = 4000;
const QUESTION_GAP_MS = 2500;

// ── State helpers ──
const saveState = async (matchId, state) =>
  redis.set(STATE_KEY(matchId), JSON.stringify(state), 'EX', STATE_TTL);
const loadState = async (matchId) => {
  const raw = await redis.get(STATE_KEY(matchId));
  return raw ? JSON.parse(raw) : null;
};
const clearState = async (matchId) => redis.del(STATE_KEY(matchId));

// Use stored answerType column; fall back to type-based mapping for legacy
const getAnswerType = (q) => {
  if (q.answerType) return q.answerType;
  if (q.type === 'numeric') return 'numericInput';
  if (q.type === 'quick_input') return 'textInput';
  return 'multipleChoice';
};

// ── Question selection ──
const pickInputQuestions = async (count, opts = {}) => {
  // Phase 1 (collection): numeric only — required for "closest" scoring.
  // Phase 2 (battle): mixed numeric + text input.
  const types = opts.numericOnly ? ['numeric'] : ['numeric', 'quick_input'];
  return Question.findAll({
    where: { isActive: true, type: { [Op.in]: types } },
    order: sequelize.random(),
    limit: count,
  });
};

// ── Init ──
const initMatch = async (matchId) => {
  const players = await MatchPlayer.findAll({ where: { matchId }, attributes: ['userId'] });
  if (players.length < 2) throw new Error('1v1 يحتاج لاعبين');

  const collection = await pickInputQuestions(COLLECTION_COUNT, { numericOnly: true });
  const battle = await pickInputQuestions(BATTLE_COUNT);
  if (collection.length < COLLECTION_COUNT) {
    throw new Error(`لا يوجد عدد كافٍ من الأسئلة الرقمية (المتاح: ${collection.length}/${COLLECTION_COUNT})`);
  }
  if (battle.length < BATTLE_COUNT) {
    throw new Error(`لا يوجد عدد كافٍ من أسئلة الإدخال للمعركة (المتاح: ${battle.length}/${BATTLE_COUNT})`);
  }

  const playerState = {};
  for (const p of players) {
    playerState[p.userId] = {
      score: 0,
      power: STARTING_POWER,
      hp: 0,
      answered: false,
      answer: null,
      timeMs: null,
    };
  }

  const state = {
    matchId,
    phase: 'collection',
    currentIndex: 0,
    playerIds: players.map((p) => p.userId),
    players: playerState,
    questions: {
      collection: collection.map(serializeQuestion),
      battle: battle.map(serializeQuestion),
    },
    startedAt: Date.now(),
  };

  await saveState(matchId, state);
  await Match.update(
    { status: 'phase1', startedAt: new Date(), currentRound: 1 },
    { where: { id: matchId } }
  );

  return state;
};

const serializeQuestion = (q) => ({
  id: q.id,
  text: q.text,
  type: q.type,
  answerType: getAnswerType(q),
  correctAnswer: q.correctAnswer,
  numericTolerance: q.numericTolerance,
  category: q.category,
  difficulty: q.difficulty,
  timeLimit: Math.round(QUESTION_TIME_MS / 1000),
});

// ── Public: question payload (no answer leak) ──
const getQuestionPayload = async (matchId) => {
  const state = await loadState(matchId);
  if (!state) return null;
  const list = state.questions[state.phase];
  const q = list?.[state.currentIndex];
  if (!q) return null;
  return {
    matchId,
    questionId: q.id,
    phase: state.phase,
    answerType: q.answerType,
    text: q.text,
    index: state.currentIndex + 1,
    total: list.length,
    timeLimit: q.timeLimit,
  };
};

// ── Submit answer ──
const submitAnswer = async (matchId, userId, answer, timeMs) => {
  const state = await loadState(matchId);
  if (!state) return { ok: false, reason: 'match_not_found' };
  if (state.phase === 'ended') return { ok: false, reason: 'ended' };
  const player = state.players[userId];
  if (!player) return { ok: false, reason: 'not_player' };
  if (player.answered) return { ok: false, reason: 'already_answered' };

  player.answered = true;
  player.answer = String(answer ?? '');
  player.timeMs = Number.isFinite(Number(timeMs)) ? Number(timeMs) : QUESTION_TIME_MS;

  await saveState(matchId, state);

  const allAnswered = state.playerIds.every((id) => state.players[id].answered);
  return { ok: true, allAnswered };
};

// ── Resolve current question (calculates results) ──
const resolveQuestion = async (matchId) => {
  const state = await loadState(matchId);
  if (!state) return null;
  const list = state.questions[state.phase];
  const q = list[state.currentIndex];
  if (!q) return null;

  const correct = String(q.correctAnswer || '').trim();

  // Compute per-player diff and exact-ness
  const results = state.playerIds.map((id) => {
    const p = state.players[id];
    const ans = String(p.answer ?? '').trim();
    let diff = Number.POSITIVE_INFINITY;
    let isExact = false;

    if (q.answerType === 'numericInput') {
      const num = parseFloat(ans);
      const correctNum = parseFloat(correct);
      if (Number.isFinite(num) && Number.isFinite(correctNum)) {
        diff = Math.abs(num - correctNum);
        isExact = diff <= (q.numericTolerance || 0);
      }
    } else {
      isExact = ans.toLowerCase() === correct.toLowerCase();
      diff = isExact ? 0 : 999;
    }

    return {
      userId: id,
      value: ans,
      diff,
      timeMs: p.timeMs ?? Number.POSITIVE_INFINITY,
      isExact,
    };
  });

  const phaseResults = [];
  let attack = null;

  if (state.phase === 'collection') {
    // Awards: exact+fastest=3, exact=2, closest wrong=1, else=0
    const exacts = results.filter((r) => r.isExact);
    const fastestExact = exacts.length ? exacts.slice().sort((a, b) => a.timeMs - b.timeMs)[0] : null;
    const wrongs = results.filter((r) => !r.isExact);
    const closestWrong = wrongs.length
      ? wrongs.slice().sort((a, b) => a.diff - b.diff || a.timeMs - b.timeMs)[0]
      : null;

    for (const r of results) {
      let pts = 0;
      const fastest = fastestExact && r.userId === fastestExact.userId;
      const closest = !r.isExact && closestWrong && r.userId === closestWrong.userId && r.diff < 999;

      if (r.isExact) pts = fastest ? 3 : 2;
      else if (closest) pts = 1;

      state.players[r.userId].power += pts;
      state.players[r.userId].score += pts;

      phaseResults.push({
        userId: r.userId,
        value: r.value,
        correct: r.isExact,
        closest: !!closest,
        fastest: !!fastest,
        pointsAwarded: pts,
        correctAnswer: correct,
        newScore: state.players[r.userId].score,
        newHP: state.players[r.userId].hp,
      });
    }
  } else {
    // Battle: fastest correct attacks the others
    const exacts = results.filter((r) => r.isExact).slice().sort((a, b) => a.timeMs - b.timeMs);
    const winner = exacts[0] || null;

    for (const r of results) {
      const isAttacker = winner && r.userId === winner.userId;
      const pts = isAttacker ? 1 : 0;
      state.players[r.userId].score += pts;

      phaseResults.push({
        userId: r.userId,
        value: r.value,
        correct: r.isExact,
        closest: false,
        fastest: isAttacker,
        pointsAwarded: pts,
        correctAnswer: correct,
        newScore: state.players[r.userId].score,
        newHP: state.players[r.userId].hp,
      });
    }

    if (winner) {
      const targets = state.playerIds.filter((id) => id !== winner.userId && state.players[id].hp > 0);
      const damageEvents = [];
      for (const targetId of targets) {
        state.players[targetId].hp = Math.max(0, state.players[targetId].hp - 1);
        damageEvents.push({
          attackerId: winner.userId,
          targetId,
          damage: 1,
          targetHp: state.players[targetId].hp,
        });
      }
      attack = { events: damageEvents };
    }
  }

  // Build hp/scores snapshot
  const scoresSnap = {};
  const hpSnap = {};
  for (const id of state.playerIds) {
    scoresSnap[id] = state.players[id].score;
    hpSnap[id] = state.players[id].hp;
  }
  for (const r of phaseResults) {
    r.scores = scoresSnap;
    r.hp = hpSnap;
    r.newHP = state.players[r.userId].hp;
  }

  await saveState(matchId, state);

  // Eliminations only meaningful in battle phase (collection HP=0 by default)
  const eliminated = state.phase === 'battle'
    ? state.playerIds.filter((id) => state.players[id].hp === 0)
    : [];
  const onlyOneAlive = state.playerIds.filter((id) => state.players[id].hp > 0).length <= 1;
  const battleOverByElimination = state.phase === 'battle' && onlyOneAlive;

  return {
    questionId: q.id,
    phase: state.phase,
    results: phaseResults,
    attack,
    eliminated,
    battleOver: battleOverByElimination,
  };
};

// ── Advance to next question or transition phase ──
const advance = async (matchId) => {
  const state = await loadState(matchId);
  if (!state) return null;

  // Reset answered state for next question
  for (const id of state.playerIds) {
    state.players[id].answered = false;
    state.players[id].answer = null;
    state.players[id].timeMs = null;
  }

  state.currentIndex++;
  const list = state.questions[state.phase];

  if (state.currentIndex < list.length) {
    await saveState(matchId, state);
    return { kind: 'next-question' };
  }

  // Reached end of current phase
  if (state.phase === 'collection') {
    // Transition to battle
    const powers = {};
    for (const id of state.playerIds) {
      state.players[id].hp = state.players[id].power;
      powers[id] = state.players[id].power;
    }
    state.phase = 'battle';
    state.currentIndex = 0;
    await saveState(matchId, state);
    return { kind: 'phase-transition', powers };
  }

  // Battle ended naturally → resolve winner by HP
  return { kind: 'battle-end', winnerId: pickWinnerByHP(state) };
};

const pickWinnerByHP = (state) => {
  const ranked = state.playerIds
    .map((id) => ({ id, hp: state.players[id].hp, score: state.players[id].score }))
    .sort((a, b) => b.hp - a.hp || b.score - a.score);
  if (ranked.length < 2) return ranked[0]?.id || null;
  if (ranked[0].hp === ranked[1].hp && ranked[0].score === ranked[1].score) return null; // draw
  return ranked[0].id;
};

// ── Finalize: persist DB + grant rewards ──
const finalize = async (matchId, winnerId) => {
  const state = await loadState(matchId);
  if (!state) return null;

  state.phase = 'ended';
  await saveState(matchId, state);

  await sequelize.transaction(async (t) => {
    await Match.update(
      { status: 'finished', endedAt: new Date(), winnerId: winnerId || null },
      { where: { id: matchId }, transaction: t }
    );

    for (const userId of state.playerIds) {
      const isWinner = userId === winnerId;
      const p = state.players[userId];
      await MatchPlayer.update({
        phase1Score: p.score,
        castleHp: p.hp,
        status: p.hp === 0 ? 'eliminated' : 'active',
        eliminatedAt: p.hp === 0 ? new Date() : null,
      }, { where: { matchId, userId }, transaction: t });

      const reward = isWinner ? 50 : 10;
      await User.update({
        wins: isWinner ? sequelize.literal('"wins" + 1') : sequelize.col('wins'),
        losses: !isWinner ? sequelize.literal('"losses" + 1') : sequelize.col('losses'),
        totalPoints: sequelize.literal(`"totalPoints" + ${p.score}`),
        gold: sequelize.literal(`"gold" + ${reward}`),
      }, { where: { id: userId }, transaction: t });

      await Transaction.create({
        userId,
        amount: reward,
        type: 'win_reward',
        currency: 'gold',
        description: isWinner ? 'مكافأة فوز' : 'مكافأة مشاركة',
        matchId,
      }, { transaction: t });
    }
  });

  const scoresSnap = {};
  const hpSnap = {};
  for (const id of state.playerIds) {
    scoresSnap[id] = state.players[id].score;
    hpSnap[id] = state.players[id].hp;
  }

  await clearState(matchId);
  return {
    matchId,
    winnerId,
    scores: scoresSnap,
    hp: hpSnap,
    rewards: { gold: winnerId ? 50 : 10, xp: winnerId ? (scoresSnap[winnerId] || 0) : 0 },
  };
};

module.exports = {
  initMatch,
  getQuestionPayload,
  submitAnswer,
  resolveQuestion,
  advance,
  finalize,
  loadState,
  QUESTION_TIME_MS,
  PHASE_TRANSITION_MS,
  QUESTION_GAP_MS,
  COLLECTION_COUNT,
  BATTLE_COUNT,
};
