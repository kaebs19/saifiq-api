const friendService = require('../services/friend.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getFriends = asyncHandler(async (req, res) => {
  const friends = await friendService.getFriends(req.user.id);
  ApiResponse.success(res, friends);
});

const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await friendService.getPendingRequests(req.user.id);
  ApiResponse.success(res, requests);
});

const getBlockedUsers = asyncHandler(async (req, res) => {
  const blocked = await friendService.getBlockedUsers(req.user.id);
  ApiResponse.success(res, blocked);
});

const searchUsers = asyncHandler(async (req, res) => {
  const users = await friendService.searchUsers(req.query.q, req.user.id);
  ApiResponse.success(res, users);
});

const sendRequest = asyncHandler(async (req, res) => {
  const friendship = await friendService.sendRequest(req.user.id, req.body.userId);
  ApiResponse.success(res, friendship, 'تم إرسال طلب الصداقة', 201);
});

const addByCode = asyncHandler(async (req, res) => {
  const friendship = await friendService.addByCode(req.user.id, req.body.friendCode);
  ApiResponse.success(res, friendship, 'تم إرسال طلب الصداقة', 201);
});

const acceptRequest = asyncHandler(async (req, res) => {
  const friendship = await friendService.acceptRequest(req.user.id, req.params.id);
  ApiResponse.success(res, friendship, 'تم قبول طلب الصداقة');
});

const rejectRequest = asyncHandler(async (req, res) => {
  await friendService.rejectRequest(req.user.id, req.params.id);
  ApiResponse.success(res, null, 'تم رفض الطلب');
});

const removeFriend = asyncHandler(async (req, res) => {
  await friendService.removeFriend(req.user.id, req.params.id);
  ApiResponse.success(res, null, 'تم إلغاء الصداقة');
});

const blockUser = asyncHandler(async (req, res) => {
  await friendService.blockUser(req.user.id, req.body.userId);
  ApiResponse.success(res, null, 'تم حظر المستخدم');
});

const unblockUser = asyncHandler(async (req, res) => {
  await friendService.unblockUser(req.user.id, req.params.userId);
  ApiResponse.success(res, null, 'تم إلغاء الحظر');
});

module.exports = {
  getFriends, getPendingRequests, getBlockedUsers, searchUsers,
  sendRequest, addByCode, acceptRequest, rejectRequest,
  removeFriend, blockUser, unblockUser,
};
