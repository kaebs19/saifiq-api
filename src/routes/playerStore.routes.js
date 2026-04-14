const { Router } = require('express');
const { listActiveItems, buyItem, getInventory } = require('../controllers/store.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/items', listActiveItems);
router.post('/items/:itemType/buy', buyItem);
router.get('/inventory', getInventory);

module.exports = router;
