const { Router } = require('express');
const { listMatches, getMatch } = require('../controllers/match.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', listMatches);
router.get('/:id', getMatch);

module.exports = router;
