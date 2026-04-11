const playerService = require('../services/player.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getPlayers = asyncHandler(async (req, res) => {
  const { players, meta } = await playerService.getPlayers(req.query);
  ApiResponse.paginated(res, players, meta.total, meta.page, meta.limit);
});

const getPlayer = asyncHandler(async (req, res) => {
  const player = await playerService.getPlayerById(req.params.id);
  ApiResponse.success(res, player);
});

const updateGems = asyncHandler(async (req, res) => {
  const player = await playerService.updateGems(req.params.id, req.body);
  ApiResponse.success(res, player, '\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062C\u0648\u0627\u0647\u0631');
});

const setBan = asyncHandler(async (req, res) => {
  const player = await playerService.setBanStatus(req.params.id, req.body.isBanned);
  ApiResponse.success(res, player, req.body.isBanned ? '\u062A\u0645 \u062D\u0638\u0631 \u0627\u0644\u0644\u0627\u0639\u0628' : '\u062A\u0645 \u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631');
});

const getPlayerMatches = asyncHandler(async (req, res) => {
  const { matches, meta } = await playerService.getPlayerMatches(req.params.id, req.query);
  ApiResponse.paginated(res, matches, meta.total, meta.page, meta.limit);
});

const getPlayerTransactions = asyncHandler(async (req, res) => {
  const { transactions, meta } = await playerService.getPlayerTransactions(req.params.id, req.query);
  ApiResponse.paginated(res, transactions, meta.total, meta.page, meta.limit);
});

module.exports = { getPlayers, getPlayer, updateGems, setBan, getPlayerMatches, getPlayerTransactions };
