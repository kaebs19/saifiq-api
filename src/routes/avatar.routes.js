const { Router } = require('express');
const {
  listAvatars, selectAvatar,
  listAllAvatars, createAvatar, updateAvatar, toggleAvatar,
} = require('../controllers/avatar.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createAvatarSchema, updateAvatarSchema } = require('../validators/avatar.validator');

const router = Router();

// ── Player routes ──
router.get('/', authenticate, listAvatars);
router.post('/:id/select', authenticate, selectAvatar);

// ── Admin routes ──
router.get('/admin', authenticate, authorize('admin'), listAllAvatars);
router.post('/admin', authenticate, authorize('admin'), validate(createAvatarSchema), createAvatar);
router.patch('/admin/:id', authenticate, authorize('admin'), validate(updateAvatarSchema), updateAvatar);
router.patch('/admin/:id/toggle', authenticate, authorize('admin'), toggleAvatar);

module.exports = router;
