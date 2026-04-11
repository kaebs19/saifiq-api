const { Router } = require('express');
const { getOverview, getTopPlayers, getDailyChart } = require('../controllers/stats.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/overview', getOverview);
router.get('/top-players', getTopPlayers);
router.get('/daily-chart', getDailyChart);

module.exports = router;
