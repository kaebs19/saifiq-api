const { Match, MatchPlayer, Question, User, UserItem, Transaction, sequelize } = require('../models');
const { redis } = require('../config/redis');
const { GOLD_COSTS } = require('../config/constants');

const STATE_KEY = (matchId) => `match:${matchId}:state`;
const QUESTIONS_PER_MATCH = 8;
const QUESTION_TIME_MS = 15000;
const STARTING_HP = 100;
const DAMAGE = { easy: 10, medium: 20, hard: 30 };

// ── Question selection ──
const pickQuestions = async (count = QUESTIONS_PER_MATCH) => {
  return Question.findAll({
    where: { isActive: true },
    order: sequelize.random(),
    limit: count,
  });
};

// ── Redis state ──
const saveState = async (matchId, state) =>
  redis.set(STATE_KEY(matchId), JSON.stringify(state), 'EX', 3600);
const loadState = async (matchId) => {
  const raw = await redis.get(STATE_KEY(matchId));
  return raw ? JSON.parse(raw) : null;
};
const clearState = async (matchId) => redis.del(STATE_KEY(matchId));

// ── Match lifecycle ──
const startMatch = async (matchId) => {
  const questions = await pickQuestions();
  if (questions.length === 0) throw new Error('No active questions available');

  const players = await MatchPlayer.findAll({ where: { matchId }, attributes: ['userId'] });
  const scores = {};
  const hp = {};
  const shields = {};
  players.forEach((p) => {
    scores[p.userId] = 0;
    hp[p.userId] = STARTING_HP;
    shields[p.userId] = 0;
  });

  const state = {
    matchId,
    status: 'playing',
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      imageUrl: q.imageUrl,
      points: q.points,
      difficulty: q.difficulty,
      correctAnswer: q.correctAnswer,
      correctOptionIdx: q.options?.findIndex((o) => o.isCorrect),
      numericTolerance: q.numericTolerance,
    })),
    currentIndex: 0,
    answeredBy: {},
    scores,
    hp,
    shields,
    eliminated: [],
    startedAt: Date.now(),
  };

  await saveState(matchId, state);
  await MatchPlayer.update(
    { castleHp: STARTING_HP, castleMaxHp: STARTING_HP },
    { where: { matchId } }
  );
  await Match.update(
    { status: 'phase1', startedAt: new Date(), currentRound: 1 },
    { where: { id: matchId } }
  );
  return state;
};

const sanitizeQuestion = (q, hiddenOptions = []) => ({
  id: q.id,
  text: q.text,
  type: q.type,
  options: q.options?.map((o, idx) => hiddenOptions.includes(idx) ? null : { text: o.text }),
  imageUrl: q.imageUrl,
  points: q.points,
  difficulty: q.difficulty,
  timeMs: QUESTION_TIME_MS,
});

// Spec-compliant flat shape (iOS-friendly)
const toSpecQuestion = (matchId, q, currentIndex, total) => ({
  matchId,
  questionId: q.id,
  text: q.text,
  options: (q.options || []).map((o) => o.text),
  correctIndex: q.correctOptionIdx,
  index: currentIndex + 1,
  total,
  timeLimit: Math.round(QUESTION_TIME_MS / 1000),
});

const getSpecQuestion = async (matchId) => {
  const state = await loadState(matchId);
  if (!state) return null;
  const q = state.questions[state.currentIndex];
  if (!q) return null;
  return toSpecQuestion(matchId, q, state.currentIndex, state.questions.length);
};

const getCurrentQuestion = async (matchId) => {
  const state = await loadState(matchId);
  if (!state) return null;
  const q = state.questions[state.currentIndex];
  if (!q) return null;
  return { question: sanitizeQuestion(q), index: state.currentIndex, total: state.questions.length, hp: state.hp };
};

// ── Answer validation ──
const isCorrectAnswer = (question, answer) => {
  if (question.type === 'mcq') return Number(answer) === question.correctOptionIdx;
  if (question.type === 'numeric') {
    const num = Number(answer);
    const correct = Number(question.correctAnswer);
    return Math.abs(num - correct) <= (question.numericTolerance || 0);
  }
  if (question.type === 'quick_input') {
    return String(answer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
  }
  return false;
};

// Pick opponent with lowest HP (who's still alive)
const pickTarget = (state, attackerId) => {
  const candidates = Object.entries(state.hp)
    .filter(([uid, hp]) => uid !== attackerId && !state.eliminated.includes(uid) && hp > 0)
    .sort((a, b) => a[1] - b[1]);
  return candidates[0]?.[0] || null;
};

const applyDamage = (state, attackerId, targetId, baseDamage) => {
  let dmg = baseDamage;
  if (state.shields[targetId] > 0) {
    state.shields[targetId]--;
    dmg = 0;
  }
  state.hp[targetId] = Math.max(0, state.hp[targetId] - dmg);
  if (state.hp[targetId] === 0 && !state.eliminated.includes(targetId)) {
    state.eliminated.push(targetId);
  }
  return { damage: dmg, targetHp: state.hp[targetId] };
};

const submitAnswer = async (matchId, userId, answer, timeMs) => {
  const state = await loadState(matchId);
  if (!state || state.status !== 'playing') return null;
  if (state.eliminated.includes(userId)) return null;

  const idx = state.currentIndex;
  const question = state.questions[idx];
  if (!question) return null;

  state.answeredBy[idx] = state.answeredBy[idx] || {};
  if (state.answeredBy[idx][userId]) return null;

  const correct = isCorrectAnswer(question, answer);
  state.answeredBy[idx][userId] = { correct, timeMs };

  let attackResult = null;
  if (correct) {
    state.scores[userId] = (state.scores[userId] || 0) + (question.points || 10);
    const targetId = pickTarget(state, userId);
    if (targetId) {
      const baseDamage = DAMAGE[question.difficulty] || DAMAGE.easy;
      const result = applyDamage(state, userId, targetId, baseDamage);
      attackResult = { targetId, ...result };
    }
  }

  await saveState(matchId, state);
  return {
    correct,
    correctIndex: question.correctOptionIdx,
    questionId: question.id,
    selectedIndex: Number.isFinite(Number(answer)) ? Number(answer) : null,
    newScore: state.scores[userId],
    newHP: state.hp[userId],
    scores: state.scores,
    hp: state.hp,
    attack: attackResult,
    points: question.points,
    eliminated: state.eliminated,
  };
};

const allAnswered = (state) => {
  const answers = state.answeredBy[state.currentIndex] || {};
  const alive = Object.keys(state.scores).filter((uid) => !state.eliminated.includes(uid));
  return alive.every((uid) => answers[uid]);
};

// Check if match should end (only 1 alive player or ran out of questions)
const checkMatchOver = (state) => {
  const alive = Object.keys(state.hp).filter((uid) => state.hp[uid] > 0);
  if (alive.length <= 1) return true;
  return state.currentIndex >= state.questions.length - 1;
};

const advanceQuestion = async (matchId) => {
  const state = await loadState(matchId);
  if (!state) return null;

  if (checkMatchOver(state)) {
    return { done: true };
  }

  state.currentIndex++;
  await saveState(matchId, state);

  if (state.currentIndex >= state.questions.length) return { done: true };

  const q = state.questions[state.currentIndex];
  return {
    done: false,
    question: sanitizeQuestion(q),
    index: state.currentIndex,
    total: state.questions.length,
    hp: state.hp,
  };
};

// ── Items ──
const ITEM_EFFECTS = {
  eliminate_two: (state, userId) => {
    const q = state.questions[state.currentIndex];
    if (!q || q.type !== 'mcq') return { ok: false, reason: 'Only MCQ' };
    // Hide 2 wrong options for this user
    const wrongs = q.options
      .map((o, i) => ({ i, isCorrect: o.isCorrect }))
      .filter((o) => !o.isCorrect)
      .slice(0, 2)
      .map((o) => o.i);
    return { ok: true, effect: 'hide_options', hiddenOptions: wrongs };
  },
  hint: (state, userId) => {
    const q = state.questions[state.currentIndex];
    if (!q) return { ok: false };
    let hint = '';
    if (q.type === 'mcq') {
      const correct = q.options?.find((o) => o.isCorrect);
      hint = `\u0623\u0648\u0644 \u062D\u0631\u0641: ${correct?.text?.[0] || '?'}`;
    } else if (q.correctAnswer) {
      hint = `\u0623\u0648\u0644 \u062D\u0631\u0641: ${q.correctAnswer[0]}`;
    }
    return { ok: true, effect: 'hint', hint };
  },
  shield: (state, userId) => {
    state.shields[userId] = (state.shields[userId] || 0) + 1;
    return { ok: true, effect: 'shield_added' };
  },
  freeze_time: (state, userId) => {
    return { ok: true, effect: 'time_frozen', durationMs: 5000 };
  },
};

const useItem = async (matchId, userId, itemType) => {
  const state = await loadState(matchId);
  if (!state || state.status !== 'playing') throw new Error('Match not active');
  if (state.eliminated.includes(userId)) throw new Error('Player eliminated');

  const effect = ITEM_EFFECTS[itemType];
  if (!effect) throw new Error('\u0623\u062F\u0627\u0629 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629');

  // Check + deduct cost in a transaction
  const cost = GOLD_COSTS[itemType];
  if (!cost) throw new Error('Item has no cost');

  await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user || user.gold < cost) throw new Error('\u0631\u0635\u064A\u062F \u063A\u064A\u0631 \u0643\u0627\u0641\u064A');
    await user.update({ gold: user.gold - cost }, { transaction: t });
    await Transaction.create({
      userId,
      amount: -cost,
      type: 'item_use',
      currency: 'gold',
      description: `\u0627\u0633\u062A\u062E\u062F\u0627\u0645 ${itemType}`,
      matchId,
    }, { transaction: t });
  });

  const result = effect(state, userId);
  await saveState(matchId, state);
  return { itemType, cost, ...result };
};

// ── End match + rewards ──
const endMatch = async (matchId) => {
  const state = await loadState(matchId);
  if (!state) return null;

  // Winner: last player standing, or highest score if timeout
  const alive = Object.entries(state.hp).filter(([uid]) => !state.eliminated.includes(uid));
  let winnerId, isDraw = false;
  if (alive.length === 1) {
    winnerId = alive[0][0];
  } else {
    // Tiebreaker on score
    const entries = Object.entries(state.scores).sort((a, b) => b[1] - a[1]);
    winnerId = entries[0][0];
    if (entries.length > 1 && entries[1][1] === entries[0][1]) isDraw = true;
  }

  await sequelize.transaction(async (t) => {
    await Match.update({
      status: 'finished',
      endedAt: new Date(),
      winnerId: isDraw ? null : winnerId,
    }, { where: { id: matchId }, transaction: t });

    for (const userId of Object.keys(state.scores)) {
      const isWinner = userId === winnerId && !isDraw;
      await MatchPlayer.update({
        phase1Score: state.scores[userId],
        castleHp: state.hp[userId],
        correctAnswers: Object.values(state.answeredBy).filter((a) => a[userId]?.correct).length,
        status: state.eliminated.includes(userId) ? 'eliminated' : 'active',
        eliminatedAt: state.eliminated.includes(userId) ? new Date() : null,
      }, { where: { matchId, userId }, transaction: t });

      const reward = isWinner ? 50 : 10;
      await User.update({
        wins: isWinner ? sequelize.literal('"wins" + 1') : sequelize.col('wins'),
        losses: !isWinner ? sequelize.literal('"losses" + 1') : sequelize.col('losses'),
        totalPoints: sequelize.literal(`"totalPoints" + ${state.scores[userId]}`),
        gold: sequelize.literal(`"gold" + ${reward}`),
      }, { where: { id: userId }, transaction: t });

      await Transaction.create({
        userId,
        amount: reward,
        type: 'win_reward',
        currency: 'gold',
        description: isWinner ? '\u0645\u0643\u0627\u0641\u0623\u0629 \u0641\u0648\u0632' : '\u0645\u0643\u0627\u0641\u0623\u0629 \u0645\u0634\u0627\u0631\u0643\u0629',
        matchId,
      }, { transaction: t });
    }
  });

  await clearState(matchId);
  return { winnerId: isDraw ? null : winnerId, isDraw, scores: state.scores, hp: state.hp };
};

module.exports = {
  startMatch,
  getCurrentQuestion,
  getSpecQuestion,
  toSpecQuestion,
  submitAnswer,
  advanceQuestion,
  allAnswered,
  useItem,
  endMatch,
  loadState,
  QUESTION_TIME_MS,
};
