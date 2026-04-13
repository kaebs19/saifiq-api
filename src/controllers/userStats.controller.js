const userStatsService = require('../services/userStats.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getUserStats = asyncHandler(async (req, res) => {
  const data = await userStatsService.getUserStats(req.user.id);
  ApiResponse.success(res, data);
});

module.exports = { getUserStats };
