// Test script: simulates 2 players joining 1v1 queue and getting matched
require('dotenv').config();
const { io } = require('socket.io-client');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/config/db');
const { User } = require('../src/models');

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
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data.token;
}

function connect(token, label) {
  return new Promise((resolve, reject) => {
    const socket = io(SOCKET, { auth: { token } });
    socket.on('connect', () => {
      console.log(`[${label}] connected`);
      resolve(socket);
    });
    socket.on('connect_error', (err) => {
      console.error(`[${label}] connect_error:`, err.message);
      reject(err);
    });
  });
}

async function run() {
  try {
    await connectDB();
    await ensurePlayer('test_a', 'test_a@saifiq.com');
    await ensurePlayer('test_b', 'test_b@saifiq.com');

    const tokenA = await getToken('test_a@saifiq.com');
    const tokenB = await getToken('test_b@saifiq.com');
    console.log('✅ Got tokens');

    // Test 1: Invalid token should fail
    try {
      await connect('invalid.token.here', 'INVALID');
      console.error('❌ Invalid token should have failed');
      process.exit(1);
    } catch (e) {
      console.log('✅ Invalid token rejected:', e.message);
    }

    const sockA = await connect(tokenA, 'A');
    const sockB = await connect(tokenB, 'B');

    sockA.on('queue:joined', (data) => console.log('[A] queue:joined', data));
    sockB.on('queue:joined', (data) => console.log('[B] queue:joined', data));

    let matchFoundCount = 0;
    const onMatchFound = (label) => (data) => {
      console.log(`[${label}] match:found`, data);
      matchFoundCount++;
      if (matchFoundCount === 2) {
        console.log('✅ Both players received match:found');
        sockA.disconnect();
        sockB.disconnect();
        setTimeout(() => process.exit(0), 500);
      }
    };
    sockA.on('match:found', onMatchFound('A'));
    sockB.on('match:found', onMatchFound('B'));

    // A joins queue
    sockA.emit('queue:join', { mode: '1v1' }, (ack) => console.log('[A] ack:', ack));
    setTimeout(() => {
      // B joins queue → should trigger match:found for both
      sockB.emit('queue:join', { mode: '1v1' }, (ack) => console.log('[B] ack:', ack));
    }, 500);

    setTimeout(() => {
      console.error('❌ Timeout: did not receive match:found in 5s');
      process.exit(1);
    }, 5000);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

run();
