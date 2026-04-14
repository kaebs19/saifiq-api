const clanService = require('../services/clan.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// ── Clan Management ──
const createClan = asyncHandler(async (req, res) => {
  const clan = await clanService.createClan(req.user.id, req.body);
  ApiResponse.success(res, clan, 'تم إنشاء العشيرة', 201);
});

const getClan = asyncHandler(async (req, res) => {
  const clan = await clanService.getClan(req.params.id);
  ApiResponse.success(res, clan);
});

const updateClan = asyncHandler(async (req, res) => {
  const clan = await clanService.updateClan(req.user.id, req.params.id, req.body);
  ApiResponse.success(res, clan, 'تم التحديث');
});

const deleteClan = asyncHandler(async (req, res) => {
  await clanService.deleteClan(req.user.id, req.params.id);
  ApiResponse.success(res, null, 'تم حذف العشيرة');
});

const searchClans = asyncHandler(async (req, res) => {
  const { clans, meta } = await clanService.searchClans(req.query);
  ApiResponse.paginated(res, clans, meta.total, meta.page, meta.limit);
});

const getMyClan = asyncHandler(async (req, res) => {
  const clan = await clanService.getMyClan(req.user.id);
  ApiResponse.success(res, clan);
});

// ── Members ──
const joinClan = asyncHandler(async (req, res) => {
  const result = await clanService.joinClan(req.user.id, req.params.id);
  ApiResponse.success(res, result, result.status === 'joined' ? 'تم الانضمام' : 'تم إرسال طلب الانضمام');
});

const leaveClan = asyncHandler(async (req, res) => {
  await clanService.leaveClan(req.user.id, req.params.id);
  ApiResponse.success(res, null, 'تم المغادرة');
});

const kickMember = asyncHandler(async (req, res) => {
  await clanService.kickMember(req.user.id, req.params.id, req.params.uid);
  ApiResponse.success(res, null, 'تم الطرد');
});

const promoteMember = asyncHandler(async (req, res) => {
  await clanService.promoteMember(req.user.id, req.params.id, req.params.uid);
  ApiResponse.success(res, null, 'تمت الترقية');
});

const demoteMember = asyncHandler(async (req, res) => {
  await clanService.demoteMember(req.user.id, req.params.id, req.params.uid);
  ApiResponse.success(res, null, 'تم التنزيل');
});

const transferOwnership = asyncHandler(async (req, res) => {
  await clanService.transferOwnership(req.user.id, req.params.id, req.params.uid);
  ApiResponse.success(res, null, 'تم نقل الزعامة');
});

const acceptRequest = asyncHandler(async (req, res) => {
  await clanService.acceptRequest(req.user.id, req.params.id, req.params.rid);
  ApiResponse.success(res, null, 'تم القبول');
});

const rejectRequest = asyncHandler(async (req, res) => {
  await clanService.rejectRequest(req.user.id, req.params.id, req.params.rid);
  ApiResponse.success(res, null, 'تم الرفض');
});

const getMembers = asyncHandler(async (req, res) => {
  const { members, meta } = await clanService.getMembers(req.params.id, req.query);
  ApiResponse.paginated(res, members, meta.total, meta.page, meta.limit);
});

const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await clanService.getPendingRequests(req.user.id, req.params.id);
  ApiResponse.success(res, requests);
});

// ── Chat ──
const sendMessage = asyncHandler(async (req, res) => {
  const message = await clanService.sendMessage(req.user.id, req.params.id, req.body);
  ApiResponse.success(res, message, '', 201);
});

const sendGameCode = asyncHandler(async (req, res) => {
  const message = await clanService.sendGameCode(req.user.id, req.params.id, req.body.roomCode);
  ApiResponse.success(res, message, '', 201);
});

const getMessages = asyncHandler(async (req, res) => {
  const { messages, meta } = await clanService.getMessages(req.params.id, req.query);
  ApiResponse.paginated(res, messages, meta.total, meta.page, meta.limit);
});

const pinMessage = asyncHandler(async (req, res) => {
  const message = await clanService.pinMessage(req.user.id, req.params.id, req.params.mid);
  ApiResponse.success(res, message, message.isPinned ? 'تم التثبيت' : 'تم إلغاء التثبيت');
});

// ── Leaderboard ──
const getClanLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const data = await clanService.getClanLeaderboard(limit);
  ApiResponse.success(res, data);
});

const getMemberLeaderboard = asyncHandler(async (req, res) => {
  const data = await clanService.getMemberLeaderboard(req.params.id);
  ApiResponse.success(res, data);
});

module.exports = {
  createClan, getClan, updateClan, deleteClan, searchClans, getMyClan,
  joinClan, leaveClan, kickMember, promoteMember, demoteMember, transferOwnership,
  acceptRequest, rejectRequest, getMembers, getPendingRequests,
  sendMessage, sendGameCode, getMessages, pinMessage,
  getClanLeaderboard, getMemberLeaderboard,
};
