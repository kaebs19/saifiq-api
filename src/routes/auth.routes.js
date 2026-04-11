const { Router } = require('express');
const {
  adminLogin, register, login, googleSignIn, appleSignIn, me,
  forgotPassword, verifyResetCode, resetPassword,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const {
  adminLoginSchema, registerSchema, loginSchema, googleSchema, appleSchema,
  forgotPasswordSchema, verifyResetCodeSchema, resetPasswordSchema,
} = require('../validators/auth.validator');

const router = Router();

router.post('/admin-login', authLimiter, validate(adminLoginSchema), adminLogin);
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, validate(googleSchema), googleSignIn);
router.post('/apple', authLimiter, validate(appleSchema), appleSignIn);

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-code', authLimiter, validate(verifyResetCodeSchema), verifyResetCode);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

router.get('/me', authenticate, me);

module.exports = router;
