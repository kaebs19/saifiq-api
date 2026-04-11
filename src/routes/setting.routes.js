const { Router } = require('express');
const { getSettings, setSetting, listAdmins, createAdmin, removeAdmin } = require('../controllers/setting.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { setSettingSchema, createAdminSchema } = require('../validators/setting.validator');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', getSettings);
router.put('/:key', validate(setSettingSchema), setSetting);
router.get('/admins/list', listAdmins);
router.post('/admins', validate(createAdminSchema), createAdmin);
router.delete('/admins/:id', removeAdmin);

module.exports = router;
