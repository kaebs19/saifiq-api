const { Op } = require('sequelize');
const { User, Friendship } = require('../models');
const { isOnline } = require('../socket/connectionManager');
const notificationService = require('./notification.service');
const AppError = require('../utils/AppError');

const FRIEND_ATTRS = ['id', 'username', 'avatarUrl', 'level', 'country', 'friendCode'];

// ── Helpers ──

const findExistingRelation = async (userA, userB) => {
  return Friendship.findOne({
    where: {
      [Op.or]: [
        { requesterId: userA, addresseeId: userB },
        { requesterId: userB, addresseeId: userA },
      ],
    },
  });
};

// ── Search Users ──

const searchUsers = async (query, currentUserId) => {
  if (!query || query.length < 2) return [];

  // Get blocked user IDs to exclude
  const blocked = await Friendship.findAll({
    where: {
      [Op.or]: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      status: 'blocked',
    },
    attributes: ['requesterId', 'addresseeId'],
  });

  const blockedIds = blocked.map((f) =>
    f.requesterId === currentUserId ? f.addresseeId : f.requesterId
  );

  const excludeIds = [currentUserId, ...blockedIds];

  return User.findAll({
    where: {
      id: { [Op.notIn]: excludeIds },
      isBanned: false,
      role: 'player',
      username: { [Op.iLike]: `%${query}%` },
    },
    attributes: FRIEND_ATTRS,
    limit: 20,
  });
};

// ── Send Friend Request ──

const sendRequest = async (requesterId, addresseeId) => {
  if (requesterId === addresseeId) throw new AppError('لا يمكنك إضافة نفسك', 400);

  const target = await User.findByPk(addresseeId);
  if (!target) throw new AppError('المستخدم غير موجود', 404);

  const existing = await findExistingRelation(requesterId, addresseeId);

  if (existing) {
    if (existing.status === 'blocked') throw new AppError('لا يمكن إرسال طلب لهذا المستخدم', 403);
    if (existing.status === 'accepted') throw new AppError('أنتم أصدقاء بالفعل', 409);
    if (existing.status === 'pending') throw new AppError('يوجد طلب صداقة معلق بالفعل', 409);
  }

  const friendship = await Friendship.create({ requesterId, addresseeId, status: 'pending' });

  // Send notification to addressee
  const requester = await User.findByPk(requesterId, { attributes: ['username'] });
  await notificationService.notify(addresseeId, {
    title: 'طلب صداقة جديد',
    body: `${requester.username} يريد إضافتك كصديق`,
    type: 'system',
    data: { type: 'friend_request', friendshipId: friendship.id, requesterId },
  });

  return friendship;
};

// ── Add by Friend Code ──

const addByCode = async (userId, friendCode) => {
  const target = await User.findOne({ where: { friendCode } });
  if (!target) throw new AppError('كود الصديق غير صحيح', 404);
  return sendRequest(userId, target.id);
};

// ── Accept Request ──

const acceptRequest = async (userId, friendshipId) => {
  const friendship = await Friendship.findByPk(friendshipId);
  if (!friendship) throw new AppError('الطلب غير موجود', 404);
  if (friendship.addresseeId !== userId) throw new AppError('لا يمكنك قبول هذا الطلب', 403);
  if (friendship.status !== 'pending') throw new AppError('الطلب ليس معلقاً', 400);

  await friendship.update({ status: 'accepted' });

  // Notify requester
  const user = await User.findByPk(userId, { attributes: ['username'] });
  await notificationService.notify(friendship.requesterId, {
    title: 'تم قبول طلب الصداقة',
    body: `${user.username} قبل طلب صداقتك`,
    type: 'system',
    data: { type: 'friend_accepted', friendId: userId },
  });

  return friendship;
};

// ── Reject Request ──

const rejectRequest = async (userId, friendshipId) => {
  const friendship = await Friendship.findByPk(friendshipId);
  if (!friendship) throw new AppError('الطلب غير موجود', 404);
  if (friendship.addresseeId !== userId) throw new AppError('لا يمكنك رفض هذا الطلب', 403);
  if (friendship.status !== 'pending') throw new AppError('الطلب ليس معلقاً', 400);

  await friendship.destroy();
  return { deleted: true };
};

// ── Remove Friend ──

const removeFriend = async (userId, friendshipId) => {
  const friendship = await Friendship.findByPk(friendshipId);
  if (!friendship) throw new AppError('الصداقة غير موجودة', 404);

  const isInvolved = friendship.requesterId === userId || friendship.addresseeId === userId;
  if (!isInvolved) throw new AppError('لا يمكنك حذف هذه الصداقة', 403);
  if (friendship.status !== 'accepted') throw new AppError('هذه ليست صداقة نشطة', 400);

  await friendship.destroy();
  return { deleted: true };
};

// ── Block User ──

const blockUser = async (userId, targetId) => {
  if (userId === targetId) throw new AppError('لا يمكنك حظر نفسك', 400);

  const existing = await findExistingRelation(userId, targetId);

  if (existing) {
    if (existing.status === 'blocked' && existing.blockedBy === userId) {
      throw new AppError('المستخدم محظور بالفعل', 409);
    }
    await existing.update({ status: 'blocked', blockedBy: userId });
    return existing;
  }

  return Friendship.create({
    requesterId: userId,
    addresseeId: targetId,
    status: 'blocked',
    blockedBy: userId,
  });
};

// ── Unblock User ──

const unblockUser = async (userId, targetId) => {
  const existing = await findExistingRelation(userId, targetId);
  if (!existing || existing.status !== 'blocked') throw new AppError('المستخدم غير محظور', 404);
  if (existing.blockedBy !== userId) throw new AppError('لا يمكنك إلغاء هذا الحظر', 403);

  await existing.destroy();
  return { deleted: true };
};

// ── Get Friends List ──

const getFriends = async (userId) => {
  const friendships = await Friendship.findAll({
    where: {
      [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
      status: 'accepted',
    },
    include: [
      { model: User, as: 'requester', attributes: FRIEND_ATTRS },
      { model: User, as: 'addressee', attributes: FRIEND_ATTRS },
    ],
    order: [['updatedAt', 'DESC']],
  });

  return friendships.map((f) => {
    const friend = f.requesterId === userId ? f.addressee : f.requester;
    return {
      friendshipId: f.id,
      ...friend.toJSON(),
      isOnline: isOnline(friend.id),
    };
  });
};

// ── Get Pending Requests ──

const getPendingRequests = async (userId) => {
  const requests = await Friendship.findAll({
    where: { addresseeId: userId, status: 'pending' },
    include: [{ model: User, as: 'requester', attributes: FRIEND_ATTRS }],
    order: [['createdAt', 'DESC']],
  });

  return requests.map((r) => ({
    friendshipId: r.id,
    ...r.requester.toJSON(),
    requestedAt: r.createdAt,
  }));
};

// ── Get Blocked Users ──

const getBlockedUsers = async (userId) => {
  const blocks = await Friendship.findAll({
    where: { blockedBy: userId, status: 'blocked' },
    include: [
      { model: User, as: 'requester', attributes: FRIEND_ATTRS },
      { model: User, as: 'addressee', attributes: FRIEND_ATTRS },
    ],
  });

  return blocks.map((b) => {
    const blocked = b.requesterId === userId ? b.addressee : b.requester;
    return { friendshipId: b.id, ...blocked.toJSON() };
  });
};

// ── Check if two users are friends ──

const areFriends = async (userA, userB) => {
  const rel = await findExistingRelation(userA, userB);
  return rel?.status === 'accepted';
};

// ── Check if blocked ──

const isBlocked = async (userA, userB) => {
  const rel = await findExistingRelation(userA, userB);
  return rel?.status === 'blocked';
};

module.exports = {
  searchUsers, sendRequest, addByCode,
  acceptRequest, rejectRequest, removeFriend,
  blockUser, unblockUser,
  getFriends, getPendingRequests, getBlockedUsers,
  areFriends, isBlocked,
};
