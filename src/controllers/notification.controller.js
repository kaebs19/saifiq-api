const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const { notifications, meta } = await notificationService.getUserNotifications(req.user.id, req.query);
  ApiResponse.paginated(res, notifications, meta.total, meta.page, meta.limit);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  ApiResponse.success(res, { count });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  if (!notification) {
    return ApiResponse.error(res, '\u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F', 404);
  }
  ApiResponse.success(res, notification, '\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const count = await notificationService.markAllAsRead(req.user.id);
  ApiResponse.success(res, { count }, `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B ${count} \u0625\u0634\u0639\u0627\u0631`);
});

const updateFcmToken = asyncHandler(async (req, res) => {
  await notificationService.updateFcmToken(req.user.id, req.body.fcmToken);
  ApiResponse.success(res, null, '\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0640 token');
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, updateFcmToken };
