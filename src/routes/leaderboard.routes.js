const { Router } = require('express');
const { getLeaderboard } = require('../controllers/leaderboard.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, getLeaderboard);

module.exports = router;
