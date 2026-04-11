const { Router } = require('express');
const { getNotifications, getUnreadCount, markAsRead, markAllAsRead, updateFcmToken } = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { fcmTokenSchema } = require('../validators/notification.validator');

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.put('/fcm-token', validate(fcmTokenSchema), updateFcmToken);

module.exports = router;
