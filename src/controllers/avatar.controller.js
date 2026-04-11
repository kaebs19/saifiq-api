const avatarService = require('../services/avatar.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// ── Player ──

const listAvatars = asyncHandler(async (req, res) => {
  const avatars = await avatarService.listAvatars();
  ApiResponse.success(res, avatars);
});

const selectAvatar = asyncHandler(async (req, res) => {
  const data = await avatarService.selectAvatar(req.user.id, req.params.id);
  ApiResponse.success(res, data, 'تم تغيير الصورة الشخصية');
});

// ── Admin ──

const listAllAvatars = asyncHandler(async (req, res) => {
  const avatars = await avatarService.listAllAvatars();
  ApiResponse.success(res, avatars);
});

const createAvatar = asyncHandler(async (req, res) => {
  const avatar = await avatarService.createAvatar(req.body);
  ApiResponse.success(res, avatar, 'تم إضافة الصورة', 201);
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatar = await avatarService.updateAvatar(req.params.id, req.body);
  ApiResponse.success(res, avatar, 'تم تحديث الصورة');
});

const toggleAvatar = asyncHandler(async (req, res) => {
  const avatar = await avatarService.toggleAvatar(req.params.id);
  ApiResponse.success(res, avatar, avatar.isActive ? 'تم تفعيل الصورة' : 'تم تعطيل الصورة');
});

module.exports = { listAvatars, selectAvatar, listAllAvatars, createAvatar, updateAvatar, toggleAvatar };
