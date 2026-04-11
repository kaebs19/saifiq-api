// Full game loop test: 2 players → matchmake → play 5 questions → match ends with rewards
require('dotenv').config();
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

function setupPlayer(socket, label) {
  socket.on('match:found', ({ matchId }) => {
    console.log(`[${label}] match:found ${matchId.slice(0, 8)}, joining room`);
    socket.emit('match:join', { matchId });
  });

  socket.on('match:started', () => console.log(`[${label}] match:started`));

  socket.on('match:question', ({ question, index, total }) => {
    console.log(`[${label}] Q${index + 1}/${total}: ${question.text.slice(0, 40)}`);
    // Auto-answer (sometimes correct, sometimes wrong for variety)
    setTimeout(() => {
      let answer;
      if (question.type === 'mcq') {
        answer = label === 'A' ? 0 : Math.floor(Math.random() * (question.options?.length || 4));
      } else {
        answer = '0';
      }
      socket.emit('match:answer', { matchId: socket.matchId, answer, timeMs: 1500 }, (ack) => {
        console.log(`[${label}] answer ack:`, ack);
      });
    }, 200 + Math.random() * 300);
  });

  socket.on('match:answer-submitted', ({ userId, correct, scores }) => {
    if (userId !== socket.user?.id) return;
    console.log(`[${label}] all scores:`, scores);
  });

  socket.on('match:ended', (summary) => {
    console.log(`[${label}] match:ended`, summary);
  });

  socket.on('connected', (u) => { socket.user = u; });
}

async function run() {
  await connectDB();

  const qCount = await Question.count({ where: { isActive: true } });
  if (qCount < 5) {
    console.error(`❌ Need at least 5 active questions, found ${qCount}`);
    process.exit(1);
  }

  await ensurePlayer('test_a', 'test_a@saifiq.com');
  await ensurePlayer('test_b', 'test_b@saifiq.com');
  const tokenA = await getToken('test_a@saifiq.com');
  const tokenB = await getToken('test_b@saifiq.com');

  const sockA = await connect(tokenA);
  const sockB = await connect(tokenB);
  setupPlayer(sockA, 'A');
  setupPlayer(sockB, 'B');

  // Capture matchId for answering
  sockA.on('match:found', ({ matchId }) => { sockA.matchId = matchId; });
  sockB.on('match:found', ({ matchId }) => { sockB.matchId = matchId; });

  let endedCount = 0;
  const onEnded = () => {
    endedCount++;
    if (endedCount === 2) {
      console.log('✅ Full match completed for both players');
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
    console.error('❌ Timeout: match did not complete in 120s');
    process.exit(1);
  }, 120000);
}

run().catch((e) => { console.error('❌', e.message); process.exit(1); });
