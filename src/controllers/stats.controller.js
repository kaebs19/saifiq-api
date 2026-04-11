const statsService = require('../services/stats.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getOverview = asyncHandler(async (req, res) => {
  const data = await statsService.getOverview();
  ApiResponse.success(res, data);
});

const getTopPlayers = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const players = await statsService.getTopPlayers(limit);
  ApiResponse.success(res, players);
});

const getDailyChart = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 7, 30);
  const data = await statsService.getDailyChart(days);
  ApiResponse.success(res, data);
});

module.exports = { getOverview, getTopPlayers, getDailyChart };
