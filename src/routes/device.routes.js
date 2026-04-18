const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const deviceService = require('../services/device.service');

const router = Router();
router.use(authenticate);

router.post('/register', asyncHandler(async (req, res) => {
  const device = await deviceService.register(req.user.id, req.body);
  ApiResponse.success(res, device, 'تم التسجيل');
}));

router.post('/unregister', asyncHandler(async (req, res) => {
  await deviceService.unregister(req.user.id);
  ApiResponse.success(res, null, 'تم إلغاء التسجيل');
}));

module.exports = router;
