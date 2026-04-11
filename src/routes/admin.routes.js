const { Router } = require('express');
const { sendNotification, broadcastNotification, listNotifications } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendNotificationSchema, broadcastSchema } = require('../validators/notification.validator');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/notifications', listNotifications);
router.post('/notifications/send', validate(sendNotificationSchema), sendNotification);
router.post('/notifications/broadcast', validate(broadcastSchema), broadcastNotification);

module.exports = router;
