const { Router } = require('express');
const { searchUsers, grantCurrency, getAuditLog } = require('../controllers/adminUser.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { grantSchema } = require('../validators/adminUser.validator');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/users/search', searchUsers);
router.post('/users/:userId/grant', validate(grantSchema), grantCurrency);
router.get('/audit', getAuditLog);

module.exports = router;
