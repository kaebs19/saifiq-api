require('dotenv').config({ override: true });

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { connectDB } = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const { initSocket } = require('./src/config/socket');
const { initFirebase } = require('./src/config/firebase');
const errorHandler = require('./src/middleware/errorHandler');
const { globalLimiter } = require('./src/middleware/rateLimit');
const routes = require('./src/routes');

const cors = require('cors');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Trust reverse proxy (nginx) for correct client IPs in rate limiter
app.set('trust proxy', 1);

// Apple Universal Links — must be served before SPA fallback
app.get('/.well-known/apple-app-site-association', (req, res) => {
  const teamId = process.env.APPLE_TEAM_ID || 'ZN3Z5KRWM7';
  const bundleId = process.env.APPLE_BUNDLE_ID || 'com.saifiq.app';
  res.setHeader('Content-Type', 'application/json');
  res.json({
    applinks: {
      apps: [],
      details: [{ appID: `${teamId}.${bundleId}`, paths: ['/join/*', '/clan/*'] }],
    },
  });
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow uploads from dashboard
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global rate limit on all API routes
app.use('/api/', globalLimiter);

app.use('/api/v1', routes);

// Serve dashboard in production
const clientBuild = path.join(__dirname, 'client', 'dist');
const fs = require('fs');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('{*path}', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/socket.io/') || req.path.startsWith('/.well-known/')) {
      return next();
    }
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'ok', app: 'SaifIQ API' });
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await connectRedis();
  initFirebase();
  initSocket(io);

  server.listen(PORT, () => {
    console.log(`🗡️ SaifIQ API running on port ${PORT}`);
  });
};

start();
