const { Router } = require('express');
const { listItems, updateItem, toggleItem, listTransactions } = require('../controllers/store.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateItemSchema } = require('../validators/item.validator');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/items', listItems);
router.patch('/items/:id', validate(updateItemSchema), updateItem);
router.patch('/items/:id/toggle', toggleItem);
router.get('/transactions', listTransactions);

module.exports = router;
