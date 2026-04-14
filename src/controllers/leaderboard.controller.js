const leaderboardService = require('../services/leaderboard.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getLeaderboard = asyncHandler(async (req, res) => {
  const type = req.query.type || 'all_time';
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);

  let data;
  switch (type) {
    case 'weekly':
      data = { players: await leaderboardService.getTopWeekly(limit) };
      break;
    case 'friends':
      data = await leaderboardService.getTopFriends(req.user.id, limit);
      break;
    case 'all_time':
    default:
      data = { players: await leaderboardService.getTopAllTime(limit) };
      break;
  }

  ApiResponse.success(res, data);
});

module.exports = { getLeaderboard };
