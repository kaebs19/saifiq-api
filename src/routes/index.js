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
const friendRoutes = require('./friend.routes');
const userStatsRoutes = require('./userStats.routes');
const playerStoreRoutes = require('./playerStore.routes');
const leaderboardRoutes = require('./leaderboard.routes');
const clanRoutes = require('./clan.routes');

const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const roomService = require('../services/room.service');

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
router.use('/friends', friendRoutes);
router.use('/user', userStatsRoutes);
router.use('/store', playerStoreRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/clans', clanRoutes);

// Room info (public — for invite links)
router.get('/rooms/:code', asyncHandler(async (req, res) => {
  const room = await roomService.getRoomByCode(req.params.code);
  if (!room) return ApiResponse.success(res, null, 'الغرفة غير موجودة', 404);
  const required = roomService.REQUIRED[room.mode];
  ApiResponse.success(res, {
    code: room.code,
    mode: room.mode,
    hostName: room.players[0]?.username,
    playerCount: room.players.length,
    required,
    isFull: room.players.length >= required,
  });
}));

module.exports = router;
