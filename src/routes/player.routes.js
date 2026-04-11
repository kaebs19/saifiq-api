const { Router } = require('express');
const { getPlayers, getPlayer, updateGems, setBan, getPlayerMatches, getPlayerTransactions } = require('../controllers/player.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateGemsSchema, setBanSchema } = require('../validators/player.validator');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', getPlayers);
router.get('/:id', getPlayer);
router.get('/:id/matches', getPlayerMatches);
router.get('/:id/transactions', getPlayerTransactions);
router.patch('/:id/gems', validate(updateGemsSchema), updateGems);
router.patch('/:id/ban', validate(setBanSchema), setBan);

module.exports = router;
