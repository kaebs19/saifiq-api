const settingService = require('../services/setting.service');
const adminMgmtService = require('../services/admin-management.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingService.getAll();
  ApiResponse.success(res, settings);
});

const setSetting = asyncHandler(async (req, res) => {
  const row = await settingService.set(req.params.key, req.body.value, req.user.id);
  ApiResponse.success(res, row, '\u062A\u0645 \u0627\u0644\u062D\u0641\u0638');
});

const listAdmins = asyncHandler(async (req, res) => {
  const admins = await adminMgmtService.listAdmins();
  ApiResponse.success(res, admins);
});

const createAdmin = asyncHandler(async (req, res) => {
  const admin = await adminMgmtService.createAdmin(req.body);
  ApiResponse.success(res, admin, '\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0623\u062F\u0645\u0646', 201);
});

const removeAdmin = asyncHandler(async (req, res) => {
  await adminMgmtService.removeAdmin(req.params.id, req.user.id);
  ApiResponse.success(res, null, '\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0623\u062F\u0645\u0646');
});

module.exports = { getSettings, setSetting, listAdmins, createAdmin, removeAdmin };
