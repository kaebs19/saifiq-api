const { Router } = require('express');
const { getStatus, spin, getConfig } = require('../controllers/spin.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

// Player endpoints
router.get('/status', authenticate, getStatus);
router.post('/spin', authenticate, spin);

// Admin endpoint (for viewing full config with weights)
router.get('/config', authenticate, authorize('admin'), getConfig);

module.exports = router;
