const { Router } = require('express');
const c = require('../controllers/clan.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createClanSchema, updateClanSchema, messageSchema, gameCodeSchema, reportSchema, muteSchema } = require('../validators/clan.validator');

const router = Router();
router.use(authenticate);

// Clan management
router.post('/', validate(createClanSchema), c.createClan);
router.get('/search', c.searchClans);
router.get('/my', c.getMyClan);
router.get('/leaderboard', c.getClanLeaderboard);
router.get('/:id', c.getClan);
router.patch('/:id', validate(updateClanSchema), c.updateClan);
router.delete('/:id', c.deleteClan);

// Members
router.post('/:id/join', c.joinClan);
router.post('/:id/leave', c.leaveClan);
router.get('/:id/members', c.getMembers);
router.post('/:id/members/:uid/kick', c.kickMember);
router.post('/:id/members/:uid/promote', c.promoteMember);
router.post('/:id/members/:uid/demote', c.demoteMember);
router.post('/:id/members/:uid/mute', validate(muteSchema), c.muteMember);
router.post('/:id/members/:uid/unmute', c.unmuteMember);
router.post('/:id/transfer/:uid', c.transferOwnership);

// Requests
router.get('/:id/requests', c.getPendingRequests);
router.post('/:id/requests/:rid/accept', c.acceptRequest);
router.post('/:id/requests/:rid/reject', c.rejectRequest);

// Chat
router.get('/:id/chat', c.getMessages);
router.post('/:id/chat', validate(messageSchema), c.sendMessage);
router.post('/:id/chat/game-code', validate(gameCodeSchema), c.sendGameCode);
router.post('/:id/chat/:mid/pin', c.pinMessage);
router.delete('/:id/chat/:mid', c.deleteMessage);
router.delete('/:id/chat', c.clearChatMessages);
router.post('/:id/chat/:mid/report', validate(reportSchema), c.reportMessage);

// Events / History
router.get('/:id/events', c.getEvents);

// Treasury
router.post('/:id/treasury/donate', c.donateTreasury);
router.get('/:id/treasury/history', c.getTreasuryHistory);

// Wars
router.get('/:id/wars/current', c.getCurrentWar);

// Member leaderboard
router.get('/:id/leaderboard', c.getMemberLeaderboard);

module.exports = router;
