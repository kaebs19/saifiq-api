const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const settingService = require('../services/setting.service');

const PUBLIC_KEYS = ['privacy_policy', 'terms_of_use', 'about_app', 'contact_us'];

const router = Router();

router.get('/:key', asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (!PUBLIC_KEYS.includes(key)) {
    throw new AppError('\u0645\u062D\u062A\u0648\u0649 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F', 404);
  }
  const value = await settingService.get(key);
  ApiResponse.success(res, { key, value: value || null });
}));

router.get('/', asyncHandler(async (req, res) => {
  const all = {};
  await Promise.all(PUBLIC_KEYS.map(async (k) => {
    all[k] = await settingService.get(k) || null;
  }));
  ApiResponse.success(res, all);
}));

module.exports = router;
