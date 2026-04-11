const { Router } = require('express');
const {
  getFriends, getPendingRequests, getBlockedUsers, searchUsers,
  sendRequest, addByCode, acceptRequest, rejectRequest,
  removeFriend, blockUser, unblockUser,
} = require('../controllers/friend.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendRequestSchema, addByCodeSchema, blockSchema } = require('../validators/friend.validator');

const router = Router();

router.use(authenticate);

router.get('/', getFriends);
router.get('/requests', getPendingRequests);
router.get('/blocked', getBlockedUsers);
router.get('/search', searchUsers);

router.post('/request', validate(sendRequestSchema), sendRequest);
router.post('/add-by-code', validate(addByCodeSchema), addByCode);

router.patch('/:id/accept', acceptRequest);
router.patch('/:id/reject', rejectRequest);
router.delete('/:id', removeFriend);

router.post('/block', validate(blockSchema), blockUser);
router.delete('/block/:userId', unblockUser);

module.exports = router;
