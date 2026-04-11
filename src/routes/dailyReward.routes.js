const { Router } = require('express');
const { getStatus, claim, getConfig } = require('../controllers/dailyReward.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.get('/status', authenticate, getStatus);
router.post('/claim', authenticate, claim);
router.get('/config', authenticate, authorize('admin'), getConfig);

module.exports = router;
