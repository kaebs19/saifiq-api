const matchService = require('../services/match.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const listMatches = asyncHandler(async (req, res) => {
  const { matches, meta } = await matchService.listMatches(req.query);
  ApiResponse.paginated(res, matches, meta.total, meta.page, meta.limit);
});

const getMatch = asyncHandler(async (req, res) => {
  const match = await matchService.getMatchById(req.params.id);
  ApiResponse.success(res, match);
});

module.exports = { listMatches, getMatch };
