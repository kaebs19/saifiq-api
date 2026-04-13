const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const jwksClient = require('jwks-rsa');
const { Op } = require('sequelize');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const crypto = require('crypto');
const { ROLES } = require('../config/constants');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateFriendCode = () => {
  return crypto.randomInt(100000, 999999).toString(); // e.g. "482951"
};

const appleJwksClient = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
  cache: true,
  cacheMaxAge: 86400000,
});

// ── Helpers ──

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  country: user.country,
  friendCode: user.friendCode,
});

// ── Admin Login ──

const adminLogin = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError('\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0645\u0633\u062C\u0644', 404);
  }

  if (user.role !== ROLES.ADMIN) {
    throw new AppError('\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062F\u062E\u0648\u0644', 403);
  }

  if (user.isBanned) {
    throw new AppError('\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u062D\u0638\u0648\u0631', 403);
  }

  if (!user.passwordHash) {
    throw new AppError('\u0644\u0645 \u064A\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0644\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628', 400);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629', 401);
  }

  return { token: generateToken(user), user: sanitizeUser(user) };
};

// ── Player Register ──

const register = async ({ username, email, password, country }) => {
  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    throw new AppError('\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u0628\u0642\u0627\u064B', 409);
  }

  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) {
    throw new AppError('\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u0628\u0642\u0627\u064B', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    username,
    email,
    passwordHash,
    country,
    friendCode: generateFriendCode(),
    role: ROLES.PLAYER,
  });

  return { token: generateToken(user), user: sanitizeUser(user) };
};

// ── Player Login ──

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError('\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0645\u0633\u062C\u0644', 404);
  }

  if (user.isBanned) {
    throw new AppError('\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u062D\u0638\u0648\u0631', 403);
  }

  if (!user.passwordHash) {
    throw new AppError('\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0633\u062C\u0644 \u0639\u0628\u0631 \u062A\u0633\u062C\u064A\u0644 \u0627\u062C\u062A\u0645\u0627\u0639\u064A\u060C \u0627\u0633\u062A\u062E\u062F\u0645 Google \u0623\u0648 Apple', 400);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629', 401);
  }

  return { token: generateToken(user), user: sanitizeUser(user) };
};

// ── Google Sign-In ──

const googleLogin = async (idToken) => {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new AppError('Google token \u063A\u064A\u0631 \u0635\u0627\u0644\u062D', 401);
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({
    where: { [Op.or]: [{ googleId }, { email }] },
  });

  if (user) {
    if (user.isBanned) {
      throw new AppError('\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u062D\u0638\u0648\u0631', 403);
    }
    if (!user.googleId) {
      await user.update({ googleId, avatarUrl: user.avatarUrl || picture });
    }
  } else {
    const username = name?.replace(/\s+/g, '_').substring(0, 25) || `player_${googleId.substring(0, 8)}`;
    const uniqueUsername = await ensureUniqueUsername(username);

    user = await User.create({
      username: uniqueUsername,
      email,
      googleId,
      avatarUrl: picture,
      friendCode: generateFriendCode(),
      role: ROLES.PLAYER,
    });
  }

  return { token: generateToken(user), user: sanitizeUser(user) };
};

// ── Apple Sign-In ──

const appleLogin = async (identityToken, fullName) => {
  let decoded;
  try {
    const header = JSON.parse(
      Buffer.from(identityToken.split('.')[0], 'base64').toString()
    );
    const key = await appleJwksClient.getSigningKey(header.kid);
    decoded = jwt.verify(identityToken, key.getPublicKey(), {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
    });
  } catch (err) {
    throw new AppError('Apple token \u063A\u064A\u0631 \u0635\u0627\u0644\u062D', 401);
  }

  const { sub: appleId, email } = decoded;

  let user = await User.findOne({
    where: { [Op.or]: [{ appleId }, ...(email ? [{ email }] : [])] },
  });

  if (user) {
    if (user.isBanned) {
      throw new AppError('\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u062D\u0638\u0648\u0631', 403);
    }
    if (!user.appleId) {
      await user.update({ appleId });
    }
  } else {
    const baseName = fullName || `player_${appleId.substring(0, 8)}`;
    const username = baseName.replace(/\s+/g, '_').substring(0, 25);
    const uniqueUsername = await ensureUniqueUsername(username);

    user = await User.create({
      username: uniqueUsername,
      email: email || `${appleId}@privaterelay.appleid.com`,
      appleId,
      friendCode: generateFriendCode(),
      role: ROLES.PLAYER,
    });
  }

  return { token: generateToken(user), user: sanitizeUser(user) };
};

// ── Profile ──

const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'username', 'email', 'role', 'avatarUrl', 'level', 'gems', 'country', 'friendCode', 'createdAt'],
  });
  if (!user) throw new AppError('\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F', 404);
  return user;
};

// ── Update Profile ──

const updateProfile = async (userId, { username, country }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('المستخدم غير موجود', 404);

  if (username && username !== user.username) {
    const existing = await User.findOne({ where: { username } });
    if (existing) throw new AppError('اسم المستخدم مستخدم مسبقاً', 409);
  }

  const updates = {};
  if (username) updates.username = username;
  if (country !== undefined) updates.country = country;

  await user.update(updates);
  return sanitizeUser(user);
};

// ── Upload Avatar ──

const uploadAvatar = async (userId, file) => {
  const { deleteUpload } = require('../config/upload');
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('المستخدم غير موجود', 404);

  // Delete old avatar if it's a local upload
  if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
    deleteUpload(user.avatarUrl);
  }

  const avatarUrl = `/uploads/avatars/${file.filename}`;
  await user.update({ avatarUrl });
  return { avatarUrl };
};

// ── Utils ──

const ensureUniqueUsername = async (base) => {
  let username = base;
  let count = 0;
  while (await User.findOne({ where: { username } })) {
    count++;
    username = `${base.substring(0, 25)}_${count}`;
  }
  return username;
};

module.exports = { adminLogin, register, login, googleLogin, appleLogin, getMe, updateProfile, uploadAvatar };
