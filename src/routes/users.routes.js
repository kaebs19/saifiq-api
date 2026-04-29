const { Router } = require('express');
const { Op } = require('sequelize');
const { User, Transaction, sequelize } = require('../models');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { ROLES } = require('../config/constants');

const router = Router();

// 💰 Ad reward — يشاهد إعلان ويكسب 100 ذهب
const AD_REWARD_GOLD = 100;
const AD_REWARD_DAILY_LIMIT = 5;   // أقصى 5 إعلانات في اليوم

router.post('/me/ad-reward', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // كم إعلان شاهد اليوم
  const todayCount = await Transaction.count({
    where: {
      userId,
      type: 'ad_reward',
      createdAt: { [Op.gte]: today },
    },
  });

  if (todayCount >= AD_REWARD_DAILY_LIMIT) {
    return ApiResponse.error(res, `وصلت الحد اليومي (${AD_REWARD_DAILY_LIMIT} إعلانات)`, 429);
  }

  let newGold = 0;
  await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { lock: true, transaction: t });
    if (!user) throw new Error('المستخدم غير موجود');
    await user.update({ gold: user.gold + AD_REWARD_GOLD }, { transaction: t });
    await Transaction.create({
      userId,
      amount: AD_REWARD_GOLD,
      type: 'ad_reward',
      currency: 'gold',
      description: 'مكافأة مشاهدة إعلان',
    }, { transaction: t });
    newGold = user.gold + AD_REWARD_GOLD;
  });

  ApiResponse.success(res, {
    goldGranted: AD_REWARD_GOLD,
    newGold,
    remainingToday: AD_REWARD_DAILY_LIMIT - todayCount - 1,
  }, 'تم إضافة الذهب بنجاح');
}));

router.get('/search', authenticate, asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return ApiResponse.success(res, []);

  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  const users = await User.findAll({
    where: {
      username: { [Op.iLike]: `%${q}%` },
      id: { [Op.ne]: req.user.id },
      role: ROLES.PLAYER,
      isBanned: false,
    },
    attributes: ['id', 'username', 'avatarUrl', 'level', 'country'],
    limit,
  });

  ApiResponse.success(res, users);
}));

module.exports = router;
