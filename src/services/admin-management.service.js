const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { ROLES } = require('../config/constants');
const AppError = require('../utils/AppError');

const ADMIN_ATTRS = ['id', 'username', 'email', 'avatarUrl', 'createdAt'];

const listAdmins = async () => {
  return User.findAll({ where: { role: ROLES.ADMIN }, attributes: ADMIN_ATTRS, order: [['createdAt', 'DESC']] });
};

const createAdmin = async ({ username, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError('\u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u0628\u0642\u0627\u064B', 409);

  const usernameTaken = await User.findOne({ where: { username } });
  if (usernameTaken) throw new AppError('\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u0628\u0642\u0627\u064B', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.create({ username, email, passwordHash, role: ROLES.ADMIN });
  return User.findByPk(admin.id, { attributes: ADMIN_ATTRS });
};

const removeAdmin = async (id, currentAdminId) => {
  if (id === currentAdminId) throw new AppError('\u0644\u0627 \u064A\u0645\u0643\u0646 \u062D\u0630\u0641 \u0646\u0641\u0633\u0643', 400);
  const admin = await User.findOne({ where: { id, role: ROLES.ADMIN } });
  if (!admin) throw new AppError('\u0627\u0644\u0623\u062F\u0645\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F', 404);
  await admin.destroy();
};

module.exports = { listAdmins, createAdmin, removeAdmin };
