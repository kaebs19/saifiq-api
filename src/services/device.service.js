const { Device } = require('../models');
const AppError = require('../utils/AppError');

const register = async (userId, { deviceToken, platform = 'ios' }) => {
  if (!deviceToken) throw new AppError('deviceToken مطلوب', 400);

  const [device, created] = await Device.findOrCreate({
    where: { deviceToken },
    defaults: { userId, platform },
  });

  if (!created && device.userId !== userId) {
    await device.update({ userId, platform });
  }

  return device;
};

const unregister = async (userId) => {
  await Device.destroy({ where: { userId } });
};

module.exports = { register, unregister };
