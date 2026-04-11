const authService = require('../services/auth.service');
const passwordResetService = require('../services/passwordReset.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.adminLogin(email, password);
  ApiResponse.success(res, data, '\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0646\u062C\u0627\u062D');
});

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  ApiResponse.success(res, data, '\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0646\u062C\u0627\u062D', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  ApiResponse.success(res, data, '\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0646\u062C\u0627\u062D');
});

const googleSignIn = asyncHandler(async (req, res) => {
  const data = await authService.googleLogin(req.body.idToken);
  ApiResponse.success(res, data, '\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0646\u062C\u0627\u062D');
});

const appleSignIn = asyncHandler(async (req, res) => {
  const data = await authService.appleLogin(req.body.identityToken, req.body.fullName);
  ApiResponse.success(res, data, '\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0646\u062C\u0627\u062D');
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  ApiResponse.success(res, user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  ApiResponse.success(res, user, 'تم تحديث الملف الشخصي');
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.success(res, null, 'لم يتم إرسال صورة', 400);
  }
  const data = await authService.uploadAvatar(req.user.id, req.file);
  ApiResponse.success(res, data, 'تم رفع الصورة الشخصية');
});

const forgotPassword = asyncHandler(async (req, res) => {
  await passwordResetService.forgotPassword(req.body.email);
  ApiResponse.success(res, null, '\u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0633\u062C\u0644\u0627\u064B\u060C \u0633\u062A\u0635\u0644\u0643 \u0631\u0633\u0627\u0644\u0629 \u0628\u0631\u0645\u0632 \u0627\u0644\u0625\u0633\u062A\u0639\u0627\u062F\u0629');
});

const verifyResetCode = asyncHandler(async (req, res) => {
  const data = await passwordResetService.verifyResetCode(req.body.email, req.body.code);
  ApiResponse.success(res, data, '\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0628\u0646\u062C\u0627\u062D');
});

const resetPassword = asyncHandler(async (req, res) => {
  await passwordResetService.resetPassword(req.body.resetToken, req.body.newPassword);
  ApiResponse.success(res, null, '\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062C\u0627\u062D');
});

module.exports = {
  adminLogin, register, login, googleSignIn, appleSignIn, me,
  updateProfile, uploadAvatar,
  forgotPassword, verifyResetCode, resetPassword,
};
