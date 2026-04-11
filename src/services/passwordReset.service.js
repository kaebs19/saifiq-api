const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { redis } = require('../config/redis');
const AppError = require('../utils/AppError');
const emailService = require('./email.service');

const CODE_TTL_SECONDS = 600; // 10 minutes
const RESET_TOKEN_TTL = '15m';
const MAX_ATTEMPTS = 5;

const codeKey = (email) => `reset:code:${email.toLowerCase()}`;
const attemptsKey = (email) => `reset:attempts:${email.toLowerCase()}`;

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// ── 1. Request reset code ──
const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) return { sent: true };

  if (user.isBanned) {
    throw new AppError('\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u062D\u0638\u0648\u0631', 403);
  }

  if (!user.passwordHash) {
    throw new AppError('\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0633\u062C\u0644 \u0639\u0628\u0631 Google/Apple\u060C \u0644\u0627 \u064A\u062F\u0639\u0645 \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631', 400);
  }

  const code = generateCode();
  await redis.set(codeKey(email), code, 'EX', CODE_TTL_SECONDS);
  await redis.del(attemptsKey(email));

  await emailService.sendResetCode(email, code);
  return { sent: true };
};

// ── 2. Verify code → short-lived reset token ──
const verifyResetCode = async (email, code) => {
  const attemptsCount = parseInt(await redis.get(attemptsKey(email))) || 0;
  if (attemptsCount >= MAX_ATTEMPTS) {
    throw new AppError('\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0643\u062B\u064A\u0631\u0629\u060C \u0627\u0637\u0644\u0628 \u0631\u0645\u0632\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B', 429);
  }

  const storedCode = await redis.get(codeKey(email));
  if (!storedCode) {
    throw new AppError('\u0627\u0644\u0631\u0645\u0632 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629\u060C \u0627\u0637\u0644\u0628 \u0631\u0645\u0632\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B', 400);
  }

  if (storedCode !== code) {
    await redis.incr(attemptsKey(email));
    await redis.expire(attemptsKey(email), CODE_TTL_SECONDS);
    throw new AppError('\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D', 400);
  }

  // Code valid: burn it, issue a short-lived reset token
  await redis.del(codeKey(email));
  await redis.del(attemptsKey(email));

  const resetToken = jwt.sign(
    { email, purpose: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: RESET_TOKEN_TTL }
  );

  return { resetToken };
};

// ── 3. Reset password using the token ──
const resetPassword = async (resetToken, newPassword) => {
  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError('\u0631\u0645\u0632 \u0627\u0644\u0625\u0639\u0627\u062F\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629', 401);
  }

  if (decoded.purpose !== 'password_reset' || !decoded.email) {
    throw new AppError('\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D', 401);
  }

  const user = await User.findOne({ where: { email: decoded.email } });
  if (!user) throw new AppError('\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F', 404);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await user.update({ passwordHash });

  return { reset: true };
};

module.exports = { forgotPassword, verifyResetCode, resetPassword };
