const dailyRewardService = require('../services/dailyReward.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getStatus = asyncHandler(async (req, res) => {
  const status = await dailyRewardService.getStatus(req.user.id);
  ApiResponse.success(res, status);
});

const claim = asyncHandler(async (req, res) => {
  const result = await dailyRewardService.claim(req.user.id);
  ApiResponse.success(res, result, `\u0645\u0628\u0631\u0648\u0643! ${result.reward.label}`);
});

const getConfig = asyncHandler(async (req, res) => {
  const config = await dailyRewardService.getConfig();
  ApiResponse.success(res, config);
});

module.exports = { getStatus, claim, getConfig };
