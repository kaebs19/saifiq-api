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
  sequelize,
};
