const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const sendNotification = asyncHandler(async (req, res) => {
  const { userId, title, body, data } = req.body;
  const notification = await notificationService.notify(userId, {
    title,
    body,
    type: 'admin_custom',
    data,
  });
  ApiResponse.success(res, notification, '\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631', 201);
});

const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, body, data } = req.body;
  const result = await notificationService.broadcastAll({ title, body, data });
  ApiResponse.success(res, result, `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0644\u0640 ${result.count} \u0644\u0627\u0639\u0628`);
});

const listNotifications = asyncHandler(async (req, res) => {
  const { notifications, meta } = await notificationService.listAdminNotifications(req.query);
  ApiResponse.paginated(res, notifications, meta.total, meta.page, meta.limit);
});

module.exports = { sendNotification, broadcastNotification, listNotifications };
