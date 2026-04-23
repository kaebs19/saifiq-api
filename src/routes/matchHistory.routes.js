const { Router } = require('express');
const matchHistoryService = require('../services/matchHistory.service');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const router = Router();

router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const history = await matchHistoryService.getHistory(req.user.id, req.query.limit);
  ApiResponse.success(res, history);
}));

module.exports = router;
