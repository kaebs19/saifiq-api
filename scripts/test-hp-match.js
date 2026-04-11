// Full game loop test with HP/damage system
require('dotenv').config({ override: true });
const { io } = require('socket.io-client');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/config/db');
const { User, Question } = require('../src/models');

const API = 'http://localhost:5001/api/v1';
const SOCKET = 'http://localhost:5001';

async function ensurePlayer(username, email) {
  const existing = await User.findOne({ where: { email } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash('Test@123', 10);
  return User.create({ username, email, passwordHash, role: 'player' });
}

async function getToken(email) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test@123' }),
  });
  return (await res.json()).data.token;
}

function connect(token) {
  return new Promise((resolve, reject) => {
    const socket = io(SOCKET, { auth: { token } });
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', reject);
  });
}

function setupPlayer(socket, label, alwaysCorrect) {
  socket.on('match:found', ({ matchId }) => {
    socket.matchId = matchId;
    socket.emit('match:join', { matchId });
  });

  socket.on('match:question', ({ question, index, hp }) => {
    const hpStr = Object.entries(hp || {}).map(([k, v]) => `${k.slice(0, 4)}=${v}`).join(' ');
    console.log(`[${label}] Q${index + 1}: ${question.text.slice(0, 30)}... | ${hpStr}`);
    setTimeout(() => {
      const answer = alwaysCorrect && question.type === 'mcq' ? '__CORRECT__' : '0';
      socket.emit('match:answer', { matchId: socket.matchId, answer, timeMs: 1000 });
    }, 200 + Math.random() * 300);
  });

  socket.on('match:attack', ({ attackerId, targetId, damage, targetHp }) => {
    console.log(`[${label}] ⚔️  ${attackerId.slice(0, 4)} → ${targetId.slice(0, 4)}: -${damage} HP (${targetHp} left)`);
  });

  socket.on('match:eliminated', ({ eliminated }) => {
    console.log(`[${label}] 💀 eliminated:`, eliminated.map((e) => e.slice(0, 4)));
  });

  socket.on('match:ended', (summary) => {
    console.log(`[${label}] 🏁 match:ended`, {
      winnerId: summary.winnerId?.slice(0, 4),
      scores: summary.scores,
      hp: summary.hp,
    });
  });

  socket.on('connected', (u) => { socket.user = u; });
}

async function run() {
  await connectDB();
  const qCount = await Question.count({ where: { isActive: true } });
  console.log(`Active questions: ${qCount}`);
  if (qCount < 2) { console.error('Need 2+ questions'); process.exit(1); }

  await ensurePlayer('test_a', 'test_a@saifiq.com');
  await ensurePlayer('test_b', 'test_b@saifiq.com');
  const tokenA = await getToken('test_a@saifiq.com');
  const tokenB = await getToken('test_b@saifiq.com');

  const sockA = await connect(tokenA);
  const sockB = await connect(tokenB);

  // Patch A to always answer index 0, B answers wrong (index 3) — expect A to damage B
  setupPlayer(sockA, 'A', false);
  setupPlayer(sockB, 'B', false);

  // Override A's answer handler to pick from correct questions
  sockA.on('match:question', async ({ question, index }) => {
    // Try to guess correct option — since we hide correctOptionIdx, we pick 0 as default
    // A will get some right, B will always pick index 3 (usually wrong)
    setTimeout(() => {
      sockA.emit('match:answer', { matchId: sockA.matchId, answer: 0, timeMs: 1000 });
    }, 200);
  });
  sockB.on('match:question', async ({ question, index }) => {
    setTimeout(() => {
      sockB.emit('match:answer', { matchId: sockB.matchId, answer: 3, timeMs: 1200 });
    }, 400);
  });

  let endedCount = 0;
  const onEnded = () => {
    endedCount++;
    if (endedCount === 2) {
      console.log('✅ Match completed');
      sockA.disconnect();
      sockB.disconnect();
      setTimeout(() => process.exit(0), 500);
    }
  };
  sockA.on('match:ended', onEnded);
  sockB.on('match:ended', onEnded);

  console.log('Joining queue...');
  sockA.emit('queue:join', { mode: '1v1' });
  setTimeout(() => sockB.emit('queue:join', { mode: '1v1' }), 300);

  setTimeout(() => {
    console.error('❌ Timeout');
    process.exit(1);
  }, 180000);
}

run().catch((e) => { console.error('❌', e.message); process.exit(1); });
