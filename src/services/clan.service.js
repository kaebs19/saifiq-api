const { Op } = require('sequelize');
const { Clan, ClanMember, ClanMessage, ClanRequest, MessageReport, ClanEvent, TreasuryTransaction, ClanWar, User, Transaction, sequelize } = require('../models');
const { isOnline, getIo } = require('../socket/connectionManager');
const AppError = require('../utils/AppError');
const { getPagination, getPageMeta } = require('../utils/pagination');

const emitToClan = (clanId, event, payload) => {
  const io = getIo();
  if (io) io.to(`clan:${clanId}`).emit(event, payload);
};

const MEMBER_ATTRS = ['id', 'username', 'avatarUrl', 'country', 'level'];

// ── Helpers ──

const assertMember = async (userId, clanId) => {
  const member = await ClanMember.findOne({ where: { userId, clanId } });
  if (!member) throw new AppError('أنت لست عضواً في هذه العشيرة', 403);
  return member;
};

const assertRole = async (userId, clanId, ...roles) => {
  const member = await assertMember(userId, clanId);
  if (!roles.includes(member.role)) throw new AppError('ليس لديك صلاحية لهذا الإجراء', 403);
  return member;
};

const LEVEL_CONFIG = [
  { level: 1, pointsRequired: 0, maxMembers: 30 },
  { level: 2, pointsRequired: 5000, maxMembers: 40 },
  { level: 3, pointsRequired: 15000, maxMembers: 50 },
  { level: 4, pointsRequired: 40000, maxMembers: 50 },
  { level: 5, pointsRequired: 100000, maxMembers: 50 },
];

const checkLevelUp = async (clan, t) => {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (clan.totalPoints >= LEVEL_CONFIG[i].pointsRequired && clan.level < LEVEL_CONFIG[i].level) {
      await clan.update({ level: LEVEL_CONFIG[i].level, maxMembers: LEVEL_CONFIG[i].maxMembers }, { transaction: t });
      return LEVEL_CONFIG[i].level;
    }
  }
  return null;
};

// ── Clan Management ──

const createClan = async (userId, { name, description, badge, color }) => {
  const existing = await ClanMember.findOne({ where: { userId } });
  if (existing) throw new AppError('أنت عضو في عشيرة بالفعل', 400);

  const nameTaken = await Clan.findOne({ where: { name } });
  if (nameTaken) throw new AppError('اسم العشيرة مستخدم مسبقاً', 409);

  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { lock: true, transaction: t });
    if (user.gold < 500) throw new AppError('تحتاج 500 ذهب لإنشاء عشيرة', 400);

    await user.update({ gold: user.gold - 500 }, { transaction: t });
    await Transaction.create({
      userId, amount: -500, type: 'purchase', currency: 'gold',
      description: `إنشاء عشيرة: ${name}`,
    }, { transaction: t });

    const clan = await Clan.create({ name, description, badge, color, ownerId: userId }, { transaction: t });
    await ClanMember.create({ clanId: clan.id, userId, role: 'owner' }, { transaction: t });

    return clan;
  });
};

const getClan = async (clanId, userId = null) => {
  const clan = await Clan.findByPk(clanId, {
    include: [{ model: User, as: 'owner', attributes: MEMBER_ATTRS }],
  });
  if (!clan) throw new AppError('العشيرة غير موجودة', 404);

  const memberCount = await ClanMember.count({ where: { clanId } });
  let myRole = null;
  if (userId) {
    const member = await ClanMember.findOne({ where: { clanId, userId } });
    myRole = member?.role || null;
  }
  return { ...clan.toJSON(), memberCount, myRole };
};

const updateClan = async (userId, clanId, data) => {
  await assertRole(userId, clanId, 'owner', 'admin');
  const clan = await Clan.findByPk(clanId);
  if (!clan) throw new AppError('العشيرة غير موجودة', 404);

  const allowed = ['name', 'description', 'badge', 'color', 'isOpen', 'readOnly'];
  const patch = {};
  for (const key of allowed) if (data[key] !== undefined) patch[key] = data[key];

  if (patch.name && patch.name !== clan.name) {
    const taken = await Clan.findOne({ where: { name: patch.name } });
    if (taken) throw new AppError('اسم العشيرة مستخدم مسبقاً', 409);
  }

  await clan.update(patch);
  emitToClan(clanId, 'clan:updated', { clanId });
  return clan;
};

const deleteClan = async (userId, clanId) => {
  await assertRole(userId, clanId, 'owner');
  await sequelize.transaction(async (t) => {
    await ClanMessage.destroy({ where: { clanId }, transaction: t });
    await ClanRequest.destroy({ where: { clanId }, transaction: t });
    await ClanMember.destroy({ where: { clanId }, transaction: t });
    await Clan.destroy({ where: { id: clanId }, transaction: t });
  });
};

const searchClans = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.q) where.name = { [Op.iLike]: `%${query.q}%` };

  const { count, rows } = await Clan.findAndCountAll({
    where,
    attributes: ['id', 'name', 'description', 'badge', 'color', 'level', 'weeklyPoints', 'isOpen', 'maxMembers'],
    order: [['weeklyPoints', 'DESC']],
    limit, offset,
  });

  const clans = await Promise.all(rows.map(async (c) => {
    const memberCount = await ClanMember.count({ where: { clanId: c.id } });
    return { ...c.toJSON(), memberCount };
  }));

  return { clans, meta: getPageMeta(count, page, limit) };
};

const getMyClan = async (userId) => {
  const membership = await ClanMember.findOne({
    where: { userId },
    include: [{ model: Clan, include: [{ model: User, as: 'owner', attributes: MEMBER_ATTRS }] }],
  });
  if (!membership) return null;

  const memberCount = await ClanMember.count({ where: { clanId: membership.clanId } });
  return { ...membership.Clan.toJSON(), memberCount, myRole: membership.role };
};

// ── Members ──

const joinClan = async (userId, clanId) => {
  const existing = await ClanMember.findOne({ where: { userId } });
  if (existing) throw new AppError('أنت عضو في عشيرة بالفعل', 400);

  const clan = await Clan.findByPk(clanId);
  if (!clan) throw new AppError('العشيرة غير موجودة', 404);

  const memberCount = await ClanMember.count({ where: { clanId } });
  if (memberCount >= clan.maxMembers) throw new AppError('العشيرة ممتلئة', 400);

  if (clan.isOpen) {
    await ClanMember.create({ clanId, userId, role: 'member' });
    const user = await User.findByPk(userId, { attributes: ['id', 'username', 'avatarUrl'] });
    await ClanMessage.create({ clanId, userId, type: 'system', content: `${user.username} انضم للعشيرة` });
    emitToClan(clanId, 'clan:member-joined', { clanId, user: user.toJSON() });
    return { status: 'joined' };
  }

  const pendingRequest = await ClanRequest.findOne({ where: { clanId, userId, status: 'pending' } });
  if (pendingRequest) throw new AppError('لديك طلب انضمام معلق بالفعل', 400);

  await ClanRequest.create({ clanId, userId });
  return { status: 'pending' };
};

const leaveClan = async (userId, clanId) => {
  const member = await assertMember(userId, clanId);
  if (member.role === 'owner') throw new AppError('الزعيم لا يمكنه المغادرة — انقل الزعامة أولاً', 400);

  await member.destroy();
  const user = await User.findByPk(userId, { attributes: ['username'] });
  await ClanMessage.create({ clanId, userId, type: 'system', content: `${user.username} غادر العشيرة` });
  emitToClan(clanId, 'clan:member-left', { clanId, userId });
};

const kickMember = async (userId, clanId, targetId) => {
  const actor = await assertRole(userId, clanId, 'owner', 'admin');
  const target = await assertMember(targetId, clanId);

  if (target.role === 'owner') throw new AppError('لا يمكن طرد الزعيم', 403);
  if (target.role === 'admin' && actor.role !== 'owner') throw new AppError('فقط الزعيم يمكنه طرد المشرفين', 403);

  await target.destroy();
  const user = await User.findByPk(targetId, { attributes: ['username'] });
  await ClanMessage.create({ clanId, userId, type: 'system', content: `${user.username} تم طرده من العشيرة` });
  emitToClan(clanId, 'clan:member-left', { clanId, userId: targetId });
};

const promoteMember = async (userId, clanId, targetId) => {
  await assertRole(userId, clanId, 'owner');
  const target = await assertMember(targetId, clanId);
  if (target.role !== 'member') throw new AppError('يمكن ترقية الأعضاء فقط', 400);
  await target.update({ role: 'admin' });
  emitToClan(clanId, 'clan:member-role-changed', { clanId, userId: targetId, newRole: 'admin' });
};

const demoteMember = async (userId, clanId, targetId) => {
  await assertRole(userId, clanId, 'owner');
  const target = await assertMember(targetId, clanId);
  if (target.role !== 'admin') throw new AppError('يمكن تنزيل المشرفين فقط', 400);
  await target.update({ role: 'member' });
  emitToClan(clanId, 'clan:member-role-changed', { clanId, userId: targetId, newRole: 'member' });
};

const transferOwnership = async (userId, clanId, targetId) => {
  const owner = await assertRole(userId, clanId, 'owner');
  const target = await assertMember(targetId, clanId);

  await sequelize.transaction(async (t) => {
    await owner.update({ role: 'admin' }, { transaction: t });
    await target.update({ role: 'owner' }, { transaction: t });
    await Clan.update({ ownerId: targetId }, { where: { id: clanId }, transaction: t });
  });
};

const acceptRequest = async (userId, clanId, requestId) => {
  await assertRole(userId, clanId, 'owner', 'admin');

  const request = await ClanRequest.findByPk(requestId);
  if (!request || request.clanId !== clanId || request.status !== 'pending') {
    throw new AppError('الطلب غير موجود', 404);
  }

  const existing = await ClanMember.findOne({ where: { userId: request.userId } });
  if (existing) {
    await request.update({ status: 'rejected' });
    throw new AppError('اللاعب عضو في عشيرة أخرى', 400);
  }

  const clan = await Clan.findByPk(clanId);
  const memberCount = await ClanMember.count({ where: { clanId } });
  if (memberCount >= clan.maxMembers) throw new AppError('العشيرة ممتلئة', 400);

  await sequelize.transaction(async (t) => {
    await request.update({ status: 'accepted' }, { transaction: t });
    await ClanMember.create({ clanId, userId: request.userId, role: 'member' }, { transaction: t });
  });

  const user = await User.findByPk(request.userId, { attributes: ['id', 'username', 'avatarUrl'] });
  await ClanMessage.create({ clanId, userId: request.userId, type: 'system', content: `${user.username} انضم للعشيرة` });
  emitToClan(clanId, 'clan:member-joined', { clanId, user: user.toJSON() });
};

const rejectRequest = async (userId, clanId, requestId) => {
  await assertRole(userId, clanId, 'owner', 'admin');

  const request = await ClanRequest.findByPk(requestId);
  if (!request || request.clanId !== clanId || request.status !== 'pending') {
    throw new AppError('الطلب غير موجود', 404);
  }

  await request.update({ status: 'rejected' });
};

const getMembers = async (clanId, query) => {
  const { page, limit, offset } = getPagination(query);
  const { count, rows } = await ClanMember.findAndCountAll({
    where: { clanId },
    include: [{ model: User, attributes: MEMBER_ATTRS }],
    order: [['role', 'ASC'], ['weeklyPoints', 'DESC']],
    limit, offset,
  });

  const members = rows.map((m) => ({
    ...m.User.toJSON(),
    role: m.role,
    weeklyPoints: m.weeklyPoints,
    mutedUntil: m.mutedUntil,
    joinedAt: m.createdAt,
    isOnline: isOnline(m.userId),
  }));

  return { members, meta: getPageMeta(count, page, limit) };
};

const getPendingRequests = async (userId, clanId) => {
  await assertRole(userId, clanId, 'owner', 'admin');
  const requests = await ClanRequest.findAll({
    where: { clanId, status: 'pending' },
    include: [{ model: User, attributes: MEMBER_ATTRS }],
    order: [['createdAt', 'DESC']],
  });
  return requests;
};

// ── Chat ──

const sendMessage = async (userId, clanId, { content, type = 'text', replyToId = null }) => {
  const member = await assertMember(userId, clanId);

  // Mute check
  if (member.mutedUntil && new Date(member.mutedUntil) > new Date()) {
    throw new AppError(`أنت مكتوم حتى ${new Date(member.mutedUntil).toLocaleString('ar-SA')}`, 403);
  }

  // Read-only check
  const clan = await Clan.findByPk(clanId);
  if (clan.readOnly && member.role === 'member') {
    throw new AppError('الشات في وضع الإعلانات فقط', 403);
  }

  if (type === 'announcement') await assertRole(userId, clanId, 'owner', 'admin');

  const message = await ClanMessage.create({ clanId, userId, type, content, replyToId });
  const user = await User.findByPk(userId, { attributes: MEMBER_ATTRS });

  let replyToSnippet = null;
  let replyToUsername = null;
  if (replyToId) {
    const original = await ClanMessage.findByPk(replyToId, {
      include: [{ model: User, attributes: ['username'] }],
    });
    if (original) {
      replyToSnippet = original.content?.substring(0, 80) || '';
      replyToUsername = original.User?.username || null;
    }
  }

  const payload = { ...message.toJSON(), User: user.toJSON(), replyToSnippet, replyToUsername };
  emitToClan(clanId, 'clan:message', { clanId, message: payload });
  return payload;
};

const sendGameCode = async (userId, clanId, roomCode) => {
  await assertMember(userId, clanId);
  const user = await User.findByPk(userId, { attributes: MEMBER_ATTRS });

  const message = await ClanMessage.create({
    clanId, userId, type: 'game_code',
    content: `${user.username} يدعوكم للعب!`,
    roomCode,
  });
  const payload = { ...message.toJSON(), User: user.toJSON() };
  emitToClan(clanId, 'clan:message', { clanId, message: payload });
  return payload;
};

const getMessages = async (clanId, query) => {
  const limit = Math.min(parseInt(query.limit) || 30, 100);
  const where = { clanId };

  // Cursor-based pagination via 'before' messageId
  if (query.before) {
    const cursor = await ClanMessage.findByPk(query.before, { attributes: ['createdAt'] });
    if (cursor) where.createdAt = { [Op.lt]: cursor.createdAt };
  }

  const rows = await ClanMessage.findAll({
    where,
    include: [
      { model: User, attributes: MEMBER_ATTRS },
      {
        model: ClanMessage, as: 'replyTo',
        attributes: ['id', 'content', 'userId'],
        include: [{ model: User, attributes: ['username'] }],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit,
  });

  const messages = rows.map((msg) => {
    const json = msg.toJSON();
    if (json.replyTo) {
      json.replyToSnippet = json.replyTo.content?.substring(0, 80) || '';
      json.replyToUsername = json.replyTo.User?.username || null;
    }
    return json;
  });

  const hasMore = rows.length === limit;
  const nextBefore = hasMore ? rows[rows.length - 1].id : null;

  return { messages, limit, hasMore, nextBefore };
};

const pinMessage = async (userId, clanId, messageId) => {
  await assertRole(userId, clanId, 'owner', 'admin');
  const message = await ClanMessage.findOne({ where: { id: messageId, clanId } });
  if (!message) throw new AppError('الرسالة غير موجودة', 404);
  await message.update({ isPinned: !message.isPinned });
  emitToClan(clanId, 'clan:updated', { clanId });
  return message;
};

// ── Leaderboard ──

const getClanLeaderboard = async (limit = 50) => {
  const clans = await Clan.findAll({
    attributes: ['id', 'name', 'badge', 'color', 'level', 'weeklyPoints', 'totalPoints'],
    order: [['weeklyPoints', 'DESC'], ['totalPoints', 'DESC']],
    limit,
  });

  const ranked = await Promise.all(clans.map(async (c, i) => {
    const memberCount = await ClanMember.count({ where: { clanId: c.id } });
    return { rank: i + 1, ...c.toJSON(), memberCount };
  }));

  return ranked;
};

const getMemberLeaderboard = async (clanId) => {
  const members = await ClanMember.findAll({
    where: { clanId },
    include: [{ model: User, attributes: MEMBER_ATTRS }],
    order: [['weeklyPoints', 'DESC']],
  });

  return members.map((m, i) => ({
    rank: i + 1,
    ...m.User.toJSON(),
    role: m.role,
    weeklyPoints: m.weeklyPoints,
  }));
};

// ── Delete Message ──

const deleteMessage = async (userId, clanId, messageId) => {
  const member = await assertMember(userId, clanId);
  const message = await ClanMessage.findOne({ where: { id: messageId, clanId } });
  if (!message) throw new AppError('الرسالة غير موجودة', 404);

  // Author can delete own, admin/owner can delete any
  if (message.userId !== userId && !['admin', 'owner'].includes(member.role)) {
    throw new AppError('ليس لديك صلاحية حذف هذه الرسالة', 403);
  }

  await message.destroy();
  emitToClan(clanId, 'clan:message-deleted', { clanId, messageId });
};

// ── Clear Chat ──

const clearChat = async (userId, clanId) => {
  await assertRole(userId, clanId, 'owner');
  await ClanMessage.destroy({ where: { clanId } });
  emitToClan(clanId, 'clan:chat-cleared', { clanId });
};

// ── Report Message ──

const reportMessage = async (userId, clanId, messageId, reason) => {
  await assertMember(userId, clanId);
  const message = await ClanMessage.findOne({ where: { id: messageId, clanId } });
  if (!message) throw new AppError('الرسالة غير موجودة', 404);

  await MessageReport.create({ messageId, reporterId: userId, reason });
};

// ── Mute / Unmute ──

const muteMember = async (userId, clanId, targetId, durationMinutes) => {
  const actor = await assertRole(userId, clanId, 'owner', 'admin');
  const target = await assertMember(targetId, clanId);

  if (target.role === 'owner') throw new AppError('لا يمكن كتم الزعيم', 403);
  if (target.role === 'admin' && actor.role !== 'owner') throw new AppError('فقط الزعيم يمكنه كتم المشرفين', 403);

  const mutedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
  await target.update({ mutedUntil });
  emitToClan(clanId, 'clan:member-role-changed', { clanId, userId: targetId, newRole: target.role });
  return { mutedUntil };
};

const unmuteMember = async (userId, clanId, targetId) => {
  await assertRole(userId, clanId, 'owner', 'admin');
  const target = await assertMember(targetId, clanId);
  await target.update({ mutedUntil: null });
  emitToClan(clanId, 'clan:member-role-changed', { clanId, userId: targetId, newRole: target.role });
};

// ── Event Logger ──

const logEvent = async (clanId, type, actorId = null, targetId = null, metadata = {}) => {
  await ClanEvent.create({ clanId, type, actorId, targetId, metadata });
};

const getEvents = async (clanId, query) => {
  const limit = Math.min(parseInt(query.limit) || 50, 100);
  const events = await ClanEvent.findAll({
    where: { clanId },
    include: [
      { model: User, as: 'actor', attributes: MEMBER_ATTRS },
      { model: User, as: 'target', attributes: MEMBER_ATTRS },
    ],
    order: [['createdAt', 'DESC']],
    limit,
  });
  return events;
};

// ── Treasury ──

const donate = async (userId, clanId, amount) => {
  await assertMember(userId, clanId);
  if (!Number.isInteger(amount) || amount < 1) throw new AppError('الكمية غير صالحة', 400);

  const result = await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { lock: true, transaction: t });
    if (user.gold < amount) throw new AppError('رصيد الذهب غير كافي', 400);

    const clan = await Clan.findByPk(clanId, { lock: true, transaction: t });
    await user.update({ gold: user.gold - amount }, { transaction: t });
    await clan.update({ treasury: clan.treasury + amount }, { transaction: t });

    await TreasuryTransaction.create({
      clanId, userId, type: 'donation', amount,
    }, { transaction: t });

    await Transaction.create({
      userId, amount: -amount, type: 'purchase', currency: 'gold',
      description: `تبرع للعشيرة: ${clan.name}`,
    }, { transaction: t });

    return { amount, newTreasury: clan.treasury + amount, newUserGold: user.gold - amount };
  });

  await logEvent(clanId, 'treasury_donation', userId, null, { amount });
  return result;
};

const getTreasuryHistory = async (clanId, query) => {
  const limit = Math.min(parseInt(query.limit) || 50, 100);
  const rows = await TreasuryTransaction.findAll({
    where: { clanId },
    include: [{ model: User, attributes: MEMBER_ATTRS }],
    order: [['createdAt', 'DESC']],
    limit,
  });
  return rows;
};

// ── Clan Wars ──

const getCurrentWar = async (userId, clanId) => {
  const member = await ClanMember.findOne({ where: { userId } });
  if (!member) throw new AppError('أنت لست عضواً في عشيرة', 400);

  const war = await ClanWar.findOne({
    where: {
      [Op.or]: [{ clanAId: clanId }, { clanBId: clanId }],
      status: { [Op.in]: ['scheduled', 'active'] },
    },
    include: [
      { model: Clan, as: 'clanA', attributes: ['id', 'name', 'badge', 'color'] },
      { model: Clan, as: 'clanB', attributes: ['id', 'name', 'badge', 'color'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  if (!war) return null;

  const isClanA = war.clanAId === clanId;
  return {
    id: war.id,
    status: war.status,
    startAt: war.startAt,
    endAt: war.endAt,
    myClan: {
      clanId: isClanA ? war.clanAId : war.clanBId,
      name: isClanA ? war.clanA.name : war.clanB.name,
      badge: isClanA ? war.clanA.badge : war.clanB.badge,
      color: isClanA ? war.clanA.color : war.clanB.color,
      score: isClanA ? war.clanAScore : war.clanBScore,
    },
    enemyClan: {
      clanId: isClanA ? war.clanBId : war.clanAId,
      name: isClanA ? war.clanB.name : war.clanA.name,
      badge: isClanA ? war.clanB.badge : war.clanA.badge,
      color: isClanA ? war.clanB.color : war.clanA.color,
      score: isClanA ? war.clanBScore : war.clanAScore,
    },
    winnerClanId: war.winnerClanId,
  };
};

module.exports = {
  createClan, getClan, updateClan, deleteClan, searchClans, getMyClan,
  joinClan, leaveClan, kickMember, promoteMember, demoteMember, transferOwnership,
  acceptRequest, rejectRequest, getMembers, getPendingRequests,
  sendMessage, sendGameCode, getMessages, pinMessage,
  deleteMessage, clearChat, reportMessage, muteMember, unmuteMember,
  getClanLeaderboard, getMemberLeaderboard,
  logEvent, getEvents, donate, getTreasuryHistory, getCurrentWar,
  checkLevelUp,
};
