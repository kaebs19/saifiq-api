const { User, Transaction, UserItem } = require('../models');
const { redis } = require('../config/redis');
const settingService = require('./setting.service');
const AppError = require('../utils/AppError');
const { sequelize } = require('../models');
const { ITEM_TYPES } = require('../config/constants');

const SPIN_KEY = (userId) => `spin:${userId}:last`;
const EXTRA_KEY = (userId, date) => `spin:${userId}:extra:${date}`;

const DEFAULT_CONFIG = {
  enabled: true,
  cooldownHours: 24,
  extraSpinCost: 10,
  maxExtraSpinsPerDay: 3,
  slots: [
    { type: 'gold', value: 5, weight: 30, color: '#3b82f6', label: '5 ذهب' },
    { type: 'gold', value: 10, weight: 20, color: '#22c55e', label: '10 ذهب' },
    { type: 'gold', value: 20, weight: 10, color: '#c9a84c', label: '20 ذهب' },
    { type: 'gold', value: 50, weight: 3, color: '#ef4444', label: '50 ذهب' },
    { type: 'item', value: null, weight: 15, color: '#8b5cf6', label: '\u0623\u062F\u0627\u0629 \u0639\u0634\u0648\u0627\u0626\u064A\u0629' },
    { type: 'points', value: 50, weight: 12, color: '#f97316', label: '50 \u0646\u0642\u0637\u0629' },
    { type: 'extra_spin', value: 1, weight: 5, color: '#e0e0e0', label: '\u062F\u0648\u0631\u0629 \u0625\u0636\u0627\u0641\u064A\u0629' },
    { type: 'nothing', value: 0, weight: 5, color: '#6b7280', label: '\u062D\u0638 \u0623\u0641\u0636\u0644' },
  ],
};

const getConfig = async () => {
  const saved = await settingService.get('spin_wheel_config');
  return saved || DEFAULT_CONFIG;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const getStatus = async (userId) => {
  const config = await getConfig();
  if (!config.enabled) return { enabled: false };

  const lastSpin = await redis.get(SPIN_KEY(userId));
  const extraToday = parseInt(await redis.get(EXTRA_KEY(userId, todayKey()))) || 0;

  let canSpin = true;
  let nextFreeIn = 0;

  if (lastSpin) {
    const elapsed = Date.now() - parseInt(lastSpin);
    const cooldownMs = config.cooldownHours * 3600 * 1000;
    if (elapsed < cooldownMs) {
      canSpin = false;
      nextFreeIn = Math.ceil((cooldownMs - elapsed) / 1000);
    }
  }

  return {
    enabled: config.enabled,
    canSpin,
    nextFreeInSeconds: nextFreeIn,
    extraSpinsUsed: extraToday,
    maxExtraSpins: config.maxExtraSpinsPerDay,
    extraSpinCost: config.extraSpinCost,
    slots: config.slots.map(({ type, color, label }) => ({ type, color, label })),
  };
};

const pickSlot = (slots) => {
  const totalWeight = slots.reduce((sum, s) => sum + s.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const slot of slots) {
    rand -= slot.weight;
    if (rand <= 0) return slot;
  }
  return slots[slots.length - 1];
};

const spin = async (userId, useExtra = false) => {
  const config = await getConfig();
  if (!config.enabled) throw new AppError('\u0627\u0644\u0635\u062D\u0646 \u0627\u0644\u064A\u0648\u0645\u064A \u063A\u064A\u0631 \u0645\u0641\u0639\u0644 \u062D\u0627\u0644\u064A\u0627\u064B', 400);

  const lastSpin = await redis.get(SPIN_KEY(userId));
  const cooldownMs = config.cooldownHours * 3600 * 1000;
  const isFree = !lastSpin || (Date.now() - parseInt(lastSpin)) >= cooldownMs;

  if (!isFree && !useExtra) {
    throw new AppError('\u0627\u0646\u062A\u0638\u0631 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0645\u0647\u0644\u0629 \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0645 \u062F\u0648\u0631\u0629 \u0625\u0636\u0627\u0641\u064A\u0629', 400);
  }

  if (useExtra && isFree) {
    throw new AppError('\u0644\u062F\u064A\u0643 \u062F\u0648\u0631\u0629 \u0645\u062C\u0627\u0646\u064A\u0629 \u0645\u062A\u0627\u062D\u0629', 400);
  }

  if (useExtra) {
    const extraToday = parseInt(await redis.get(EXTRA_KEY(userId, todayKey()))) || 0;
    if (extraToday >= config.maxExtraSpinsPerDay) {
      throw new AppError('\u0648\u0635\u0644\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0644\u062F\u0648\u0631\u0627\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u064A\u0629 \u0627\u0644\u064A\u0648\u0645', 400);
    }

    const user = await User.findByPk(userId);
    if (user.gold < config.extraSpinCost) {
      throw new AppError('رصيد الذهب غير كافي', 400);
    }

    await sequelize.transaction(async (t) => {
      await User.update({ gold: sequelize.literal(`"gold" - ${config.extraSpinCost}`) }, { where: { id: userId }, transaction: t });
      await Transaction.create({ userId, amount: -config.extraSpinCost, type: 'item_use', currency: 'gold', description: 'دورة إضافية في الصحن' }, { transaction: t });
    });

    await redis.incr(EXTRA_KEY(userId, todayKey()));
    await redis.expire(EXTRA_KEY(userId, todayKey()), 86400);
  }

  // Pick reward
  const slot = pickSlot(config.slots);
  const slotIndex = config.slots.indexOf(slot);

  // Apply reward
  await applyReward(userId, slot);

  // Set cooldown (only on free spin)
  if (isFree) {
    await redis.set(SPIN_KEY(userId), String(Date.now()), 'EX', cooldownMs / 1000);
  }

  return { slotIndex, reward: { type: slot.type, value: slot.value, label: slot.label, color: slot.color } };
};

const applyReward = async (userId, slot) => {
  switch (slot.type) {
    case 'gold':
      await sequelize.transaction(async (t) => {
        await User.update({ gold: sequelize.literal(`"gold" + ${slot.value}`) }, { where: { id: userId }, transaction: t });
        await Transaction.create({ userId, amount: slot.value, type: 'daily_bonus', currency: 'gold', description: `الصحن اليومي: ${slot.label}` }, { transaction: t });
      });
      break;

    case 'points':
      await User.update({ totalPoints: sequelize.literal(`"totalPoints" + ${slot.value}`) }, { where: { id: userId } });
      break;

    case 'item': {
      const types = Object.values(ITEM_TYPES);
      const randomType = types[Math.floor(Math.random() * types.length)];
      const [userItem] = await UserItem.findOrCreate({ where: { userId, itemType: randomType }, defaults: { quantity: 0 } });
      await userItem.update({ quantity: userItem.quantity + 1 });
      break;
    }

    case 'extra_spin':
      // Grant an extra spin by incrementing the counter back
      await redis.decr(EXTRA_KEY(userId, todayKey()));
      break;

    case 'nothing':
    default:
      break;
  }
};

module.exports = { getConfig, getStatus, spin, DEFAULT_CONFIG };
