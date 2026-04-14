const { User, Transaction, UserItem } = require('../models');
const { redis } = require('../config/redis');
const settingService = require('./setting.service');
const AppError = require('../utils/AppError');
const { sequelize } = require('../models');
const { ITEM_TYPES } = require('../config/constants');

const STREAK_KEY = (userId) => `daily:streak:${userId}`;
const CLAIMED_KEY = (userId, date) => `daily:claimed:${userId}:${date}`;

const DEFAULT_CONFIG = {
  enabled: true,
  rewards: [
    { day: 1, type: 'gold', value: 5, label: '5 ذهب' },
    { day: 2, type: 'gold', value: 10, label: '10 ذهب' },
    { day: 3, type: 'gold', value: 15, label: '15 ذهب' },
    { day: 4, type: 'item', value: 'shield', label: 'درع حماية' },
    { day: 5, type: 'gold', value: 25, label: '25 ذهب' },
    { day: 6, type: 'gold', value: 30, label: '30 ذهب' },
    { day: 7, type: 'gold', value: 50, label: '50 ذهب + أداة' },
  ],
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const getConfig = async () => {
  return (await settingService.get('daily_reward_config')) || DEFAULT_CONFIG;
};

const getStatus = async (userId) => {
  const config = await getConfig();
  if (!config.enabled) return { enabled: false };

  const streakData = await redis.get(STREAK_KEY(userId));
  const streak = streakData ? JSON.parse(streakData) : { count: 0, lastDate: null };
  const claimed = !!(await redis.get(CLAIMED_KEY(userId, todayStr())));

  // Check if streak is still valid (yesterday or today)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let currentStreak = streak.count;
  if (streak.lastDate !== todayStr() && streak.lastDate !== yesterdayStr) {
    currentStreak = 0; // streak broken
  }

  const currentDay = Math.min(currentStreak + (claimed ? 0 : 1), config.rewards.length);

  return {
    enabled: true,
    claimed,
    streak: currentStreak,
    currentDay,
    maxDays: config.rewards.length,
    rewards: config.rewards,
    todayReward: claimed ? null : config.rewards[currentDay - 1],
  };
};

const claim = async (userId) => {
  const config = await getConfig();
  if (!config.enabled) throw new AppError('\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u063A\u064A\u0631 \u0645\u0641\u0639\u0644\u0629');

  const today = todayStr();
  const alreadyClaimed = await redis.get(CLAIMED_KEY(userId, today));
  if (alreadyClaimed) throw new AppError('\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0645\u0633\u0628\u0642\u0627\u064B');

  // Get/update streak
  const streakData = await redis.get(STREAK_KEY(userId));
  const streak = streakData ? JSON.parse(streakData) : { count: 0, lastDate: null };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let newCount;
  if (streak.lastDate === yesterdayStr) {
    newCount = streak.count + 1; // consecutive
  } else if (streak.lastDate === today) {
    newCount = streak.count; // same day (shouldn't happen)
  } else {
    newCount = 1; // streak reset
  }

  // Cycle back to day 1 after max
  const dayIndex = ((newCount - 1) % config.rewards.length);
  const reward = config.rewards[dayIndex];

  // Apply reward
  await applyReward(userId, reward);

  // Save streak
  await redis.set(STREAK_KEY(userId), JSON.stringify({ count: newCount, lastDate: today }));
  await redis.set(CLAIMED_KEY(userId, today), '1', 'EX', 86400 * 2);

  return {
    day: dayIndex + 1,
    streak: newCount,
    reward: { type: reward.type, value: reward.value, label: reward.label },
  };
};

const applyReward = async (userId, reward) => {
  switch (reward.type) {
    case 'gold':
      await sequelize.transaction(async (t) => {
        await User.update(
          { gold: sequelize.literal(`"gold" + ${reward.value}`) },
          { where: { id: userId }, transaction: t }
        );
        await Transaction.create({
          userId,
          amount: reward.value,
          type: 'daily_bonus',
          currency: 'gold',
          description: `مكافأة يومية: ${reward.label}`,
        }, { transaction: t });
      });
      break;

    case 'item': {
      const itemType = reward.value || 'shield';
      const [userItem] = await UserItem.findOrCreate({
        where: { userId, itemType },
        defaults: { quantity: 0 },
      });
      await userItem.update({ quantity: userItem.quantity + 1 });
      break;
    }

    case 'points':
      await User.update(
        { totalPoints: sequelize.literal(`"totalPoints" + ${reward.value}`) },
        { where: { id: userId } }
      );
      break;
  }
};

module.exports = { getConfig, getStatus, claim, DEFAULT_CONFIG };
