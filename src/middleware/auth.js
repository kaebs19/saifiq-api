const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const authenticate = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // refresh token لا يصلح للمصادقة على الطلبات العادية
    if (decoded.type === 'refresh') {
      throw new AppError('Authentication required', 401);
    }
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      req.user = decoded;
    }
  } catch (err) {
    // Token invalid — proceed without user
  }

  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new AppError('\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062F\u062E\u0648\u0644', 403);
  }
  next();
};

module.exports = { authenticate, optionalAuth, authorize };
