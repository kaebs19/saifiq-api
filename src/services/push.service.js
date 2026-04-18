/**
 * Push service — wrapper around notification.service for clan-specific events.
 * Uses Firebase Cloud Messaging (FCM) via the existing notification system.
 */
const { notify, notifyMany } = require('./notification.service');
const { ClanMember } = require('../models');

// Get all member userIds in a clan (excluding a specific user)
const getClanMemberIds = async (clanId, excludeUserId = null) => {
  const members = await ClanMember.findAll({ where: { clanId }, attributes: ['userId'] });
  return members.map((m) => m.userId).filter((id) => id !== excludeUserId);
};

// ── Clan Push Helpers ──

const pushClanMessage = async (clanId, senderUsername, content) => {
  const memberIds = await getClanMemberIds(clanId);
  if (!memberIds.length) return;
  await notifyMany(memberIds, {
    title: 'رسالة جديدة في العشيرة',
    body: `${senderUsername}: ${content.substring(0, 60)}`,
    type: 'system',
    data: { type: 'clan_message', clanId },
  });
};

const pushMemberJoined = async (clanId, username) => {
  const memberIds = await getClanMemberIds(clanId);
  await notifyMany(memberIds, {
    title: 'عضو جديد',
    body: `${username} انضم للعشيرة`,
    type: 'system',
    data: { type: 'clan_member_joined', clanId },
  });
};

const pushRoleChanged = async (clanId, targetUserId, newRole) => {
  const roleLabels = { owner: 'زعيم', admin: 'مشرف', member: 'عضو' };
  await notify(targetUserId, {
    title: 'تغيير دور',
    body: `تم تغيير دورك إلى ${roleLabels[newRole] || newRole}`,
    type: 'system',
    data: { type: 'clan_role_change', clanId, newRole },
  });
};

const pushKicked = async (clanId, targetUserId) => {
  await notify(targetUserId, {
    title: 'طرد من العشيرة',
    body: 'تم طردك من العشيرة',
    type: 'system',
    data: { type: 'clan_kicked', clanId },
  });
};

const pushMuted = async (clanId, targetUserId, mutedUntil) => {
  await notify(targetUserId, {
    title: 'تم كتمك',
    body: `تم كتمك حتى ${new Date(mutedUntil).toLocaleString('ar-SA')}`,
    type: 'system',
    data: { type: 'clan_muted', clanId, mutedUntil: mutedUntil.toISOString() },
  });
};

const pushRequestAccepted = async (clanId, targetUserId) => {
  await notify(targetUserId, {
    title: 'قُبل طلبك',
    body: 'تم قبول طلب انضمامك للعشيرة',
    type: 'system',
    data: { type: 'clan_request_accepted', clanId },
  });
};

module.exports = {
  getClanMemberIds,
  pushClanMessage,
  pushMemberJoined,
  pushRoleChanged,
  pushKicked,
  pushMuted,
  pushRequestAccepted,
};
