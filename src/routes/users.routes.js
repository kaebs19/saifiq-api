const { Router } = require('express');
const { Op } = require('sequelize');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { ROLES } = require('../config/constants');

const router = Router();

router.get('/search', authenticate, asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return ApiResponse.success(res, []);

  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  const users = await User.findAll({
    where: {
      username: { [Op.iLike]: `%${q}%` },
      id: { [Op.ne]: req.user.id },
      role: ROLES.PLAYER,
      isBanned: false,
    },
    attributes: ['id', 'username', 'avatarUrl', 'level', 'country'],
    limit,
  });

  ApiResponse.success(res, users);
}));

module.exports = router;
