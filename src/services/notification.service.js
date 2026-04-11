const { Op } = require('sequelize');
const { User, Notification, sequelize } = require('../models');
const { getMessaging } = require('../config/firebase');
const { getPagination, getPageMeta } = require('../utils/pagination');

// ── Helpers ──

const formatFcmData = (data) =>
  data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined;

const FCM_BATCH_SIZE = 500;

// ── Push Notifications ──

const sendPush = async (userId, { title, body, data }) => {
  const messaging = getMessaging();
  if (!messaging) return null;

  const user = await User.findByPk(userId, { attributes: ['fcmToken'] });
  if (!user?.fcmToken) return null;

  try {
    return await messaging.send({
      token: user.fcmToken,
      notification: { title, body },
      data: formatFcmData(data),
    });
  } catch (err) {
    if (err.code === 'messaging/invalid-registration-token' || err.code === 'messaging/registration-token-not-registered') {
      await User.update({ fcmToken: null }, { where: { id: userId } });
    }
    console.error('❌ FCM send error:', err.message);
    return null;
  }
};

const sendPushToMany = async (userIds, { title, body, data }) => {
  const messaging = getMessaging();
  if (!messaging) return null;

  const users = await User.findAll({
    where: { id: { [Op.in]: userIds }, fcmToken: { [Op.ne]: null } },
    attributes: ['fcmToken'],
  });

  const tokens = users.map((u) => u.fcmToken).filter(Boolean);
  if (!tokens.length) return null;

  try {
    return await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: formatFcmData(data),
    });
  } catch (err) {
    console.error('❌ FCM multicast error:', err.message);
    return null;
  }
};

const sendToAll = async ({ title, body, data }) => {
  const users = await User.findAll({
    where: { fcmToken: { [Op.ne]: null }, isBanned: false, role: 'player' },
    attributes: ['fcmToken'],
  });

  const tokens = users.map((u) => u.fcmToken).filter(Boolean);
  if (!tokens.length) return null;

  const messaging = getMessaging();
  if (!messaging) return null;

  const batches = [];
  for (let i = 0; i < tokens.length; i += FCM_BATCH_SIZE) {
    batches.push(tokens.slice(i, i + FCM_BATCH_SIZE));
  }

  const results = [];
  for (const batch of batches) {
    try {
      const result = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title, body },
        data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
      });
      results.push(result);
    } catch (err) {
      console.error('❌ FCM broadcast error:', err.message);
    }
  }

  return results;
};

// ── In-App Notifications ──

const createInApp = async (userId, { title, body, type = 'system', data = null, sentVia = 'both' }) => {
  return Notification.create({ userId, title, body, type, data, sentVia });
};

const notify = async (userId, { title, body, type = 'system', data = null, via = 'both' }) => {
  const notification = await createInApp(userId, { title, body, type, data, sentVia: via });

  if (via === 'push' || via === 'both') {
    await sendPush(userId, { title, body, data });
  }

  return notification;
};

const notifyMany = async (userIds, { title, body, type = 'system', data = null }) => {
  const notifications = await Notification.bulkCreate(
    userIds.map((userId) => ({ userId, title, body, type, data, sentVia: 'both' }))
  );

  await sendPushToMany(userIds, { title, body, data });

  return notifications;
};

const broadcastAll = async ({ title, body, type = 'admin_custom', data = null }) => {
  const players = await User.findAll({
    where: { isBanned: false, role: 'player' },
    attributes: ['id'],
  });

  const userIds = players.map((p) => p.id);
  if (!userIds.length) return { count: 0 };

  await Notification.bulkCreate(
    userIds.map((userId) => ({ userId, title, body, type, data, sentVia: 'both' }))
  );

  await sendToAll({ title, body, data });

  return { count: userIds.length };
};

// ── Read / Query ──

const getUserNotifications = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Notification.findAndCountAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return { notifications: rows, meta: getPageMeta(count, page, limit) };
};

const getUnreadCount = async (userId) => {
  return Notification.count({ where: { userId, isRead: false } });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId },
  });
  if (!notification) return null;
  notification.isRead = true;
  await notification.save();
  return notification;
};

const markAllAsRead = async (userId) => {
  const [count] = await Notification.update(
    { isRead: true },
    { where: { userId, isRead: false } }
  );
  return count;
};

// ── FCM Token ──

const updateFcmToken = async (userId, fcmToken) => {
  await User.update({ fcmToken }, { where: { id: userId } });
};

// ── Admin: list all sent notifications ──

const listAdminNotifications = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.type) where.type = query.type;
  if (query.search) where.title = { [Op.iLike]: `%${query.search}%` };

  const { count, rows } = await Notification.findAndCountAll({
    where,
    include: [{ model: User, attributes: ['id', 'username', 'email'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return { notifications: rows, meta: getPageMeta(count, page, limit) };
};

module.exports = {
  sendPush,
  sendPushToMany,
  sendToAll,
  createInApp,
  notify,
  notifyMany,
  broadcastAll,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  updateFcmToken,
  listAdminNotifications,
};
