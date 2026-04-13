const { Router } = require('express');
const { getUserStats } = require('../controllers/userStats.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/stats', authenticate, getUserStats);

module.exports = router;
