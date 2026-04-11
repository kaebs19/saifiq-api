const { Router } = require('express');
const authRoutes = require('./auth.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes = require('./admin.routes');
const questionRoutes = require('./question.routes');
const playerRoutes = require('./player.routes');
const statsRoutes = require('./stats.routes');
const storeRoutes = require('./store.routes');
const settingRoutes = require('./setting.routes');
const matchRoutes = require('./match.routes');
const contentRoutes = require('./content.routes');
const spinRoutes = require('./spin.routes');
const dailyRewardRoutes = require('./dailyReward.routes');
const avatarRoutes = require('./avatar.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/questions', questionRoutes);
router.use('/admin/players', playerRoutes);
router.use('/admin/stats', statsRoutes);
router.use('/admin/store', storeRoutes);
router.use('/admin/settings', settingRoutes);
router.use('/admin/matches', matchRoutes);
router.use('/content', contentRoutes);
router.use('/spin', spinRoutes);
router.use('/daily-reward', dailyRewardRoutes);
router.use('/avatars', avatarRoutes);

module.exports = router;
