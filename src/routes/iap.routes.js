const { Router } = require('express');
const { verifyPurchase, appleNotifications, listPackages } = require('../controllers/iap.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { verifySchema } = require('../validators/iap.validator');

const router = Router();

// Public: Apple webhook (no auth — verified by signed payload)
router.post('/apple-notifications', appleNotifications);

// Authenticated endpoints
router.get('/packages', authenticate, listPackages);
router.post('/verify', authenticate, validate(verifySchema), verifyPurchase);

module.exports = router;
