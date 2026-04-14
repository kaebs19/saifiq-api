const { sequelize } = require('../config/db');
const User = require('./User');
const Question = require('./Question');
const Item = require('./Item');
const UserItem = require('./UserItem');
const Match = require('./Match');
const MatchPlayer = require('./MatchPlayer');
const MatchRound = require('./MatchRound');
const RoundQuestion = require('./RoundQuestion');
const Transaction = require('./Transaction');
const Notification = require('./Notification');
const Setting = require('./Setting');
const Avatar = require('./Avatar');
const Friendship = require('./Friendship');
const Clan = require('./Clan');
const ClanMember = require('./ClanMember');
const ClanMessage = require('./ClanMessage');
const ClanRequest = require('./ClanRequest');

// ── User associations ──
User.hasMany(MatchPlayer, { foreignKey: 'userId' });
User.hasMany(Transaction, { foreignKey: 'userId' });
User.hasMany(UserItem, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId' });

// ── Match associations ──
Match.belongsTo(User, { as: 'winner', foreignKey: 'winnerId' });
Match.hasMany(MatchPlayer, { foreignKey: 'matchId' });
Match.hasMany(MatchRound, { foreignKey: 'matchId' });
Match.hasMany(RoundQuestion, { foreignKey: 'matchId' });

// ── MatchPlayer associations ──
MatchPlayer.belongsTo(User, { foreignKey: 'userId' });
MatchPlayer.belongsTo(Match, { foreignKey: 'matchId' });

// ── MatchRound associations ──
MatchRound.belongsTo(Match, { foreignKey: 'matchId' });
MatchRound.hasMany(RoundQuestion, { foreignKey: 'roundId' });

// ── RoundQuestion associations ──
RoundQuestion.belongsTo(MatchRound, { foreignKey: 'roundId' });
RoundQuestion.belongsTo(Match, { foreignKey: 'matchId' });
RoundQuestion.belongsTo(Question, { foreignKey: 'questionId' });
RoundQuestion.belongsTo(User, { as: 'winner', foreignKey: 'winnerId' });
RoundQuestion.belongsTo(User, { as: 'target', foreignKey: 'targetPlayerId' });

// ── Transaction associations ──
Transaction.belongsTo(User, { foreignKey: 'userId' });

// ── UserItem associations ──
UserItem.belongsTo(User, { foreignKey: 'userId' });

// ── Notification associations ──
Notification.belongsTo(User, { foreignKey: 'userId' });

// ── Friendship associations ──
Friendship.belongsTo(User, { as: 'requester', foreignKey: 'requesterId' });
Friendship.belongsTo(User, { as: 'addressee', foreignKey: 'addresseeId' });

// ── Clan associations ──
Clan.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Clan.hasMany(ClanMember, { foreignKey: 'clanId' });
Clan.hasMany(ClanMessage, { foreignKey: 'clanId' });
Clan.hasMany(ClanRequest, { foreignKey: 'clanId' });
ClanMember.belongsTo(User, { foreignKey: 'userId' });
ClanMember.belongsTo(Clan, { foreignKey: 'clanId' });
ClanMessage.belongsTo(User, { foreignKey: 'userId' });
ClanRequest.belongsTo(User, { foreignKey: 'userId' });
ClanRequest.belongsTo(Clan, { foreignKey: 'clanId' });
User.hasOne(ClanMember, { foreignKey: 'userId' });

module.exports = {
  User,
  Question,
  Item,
  UserItem,
  Match,
  MatchPlayer,
  MatchRound,
  RoundQuestion,
  Transaction,
  Notification,
  Setting,
  Avatar,
  Friendship,
  Clan,
  ClanMember,
  ClanMessage,
  ClanRequest,
  sequelize,
};
