const spinService = require('../services/spinWheel.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getStatus = asyncHandler(async (req, res) => {
  const status = await spinService.getStatus(req.user.id);
  ApiResponse.success(res, status);
});

const spin = asyncHandler(async (req, res) => {
  const useExtra = req.body.useExtra === true;
  const result = await spinService.spin(req.user.id, useExtra);
  ApiResponse.success(res, result, `\u0631\u0628\u062D\u062A: ${result.reward.label}`);
});

const getConfig = asyncHandler(async (req, res) => {
  const config = await spinService.getConfig();
  ApiResponse.success(res, config);
});

module.exports = { getStatus, spin, getConfig };
