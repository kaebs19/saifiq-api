const { Device } = require('../models');

// ── Push Notification Stub ──
// TODO: Integrate with APNs using 'apn' or '@parse/node-apn' package
// For now, this logs notifications. Replace with real APNs when ready.

const sendPush = async (userId, { title, body, type, data = {} }) => {
  const devices = await Device.findAll({ where: { userId } });
  if (!devices.length) return;

  // TODO: Replace with real APNs provider
  // const notification = new apn.Notification({
  //   alert: { title, body },
  //   badge: 1,
  //   sound: 'default',
  //   topic: process.env.APPLE_BUNDLE_ID,
  //   payload: { type, ...data }
  // });
  // for (const d of devices) {
  //   await apnProvider.send(notification, d.deviceToken);
  // }

  console.log(`[PUSH] → ${userId}: ${title} | ${body} | type=${type}`);
};

const sendPushToMany = async (userIds, payload) => {
  for (const userId of userIds) {
    await sendPush(userId, payload);
  }
};

module.exports = { sendPush, sendPushToMany };
