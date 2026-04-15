const adminUserService = require('../services/adminUser.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const searchUsers = asyncHandler(async (req, res) => {
  const users = await adminUserService.searchUsers(req.query);
  ApiResponse.success(res, users);
});

const grantCurrency = asyncHandler(async (req, res) => {
  const result = await adminUserService.grantCurrency(req.user.id, req.params.userId, req.body);
  const currencyLabel = result.currency === 'gold' ? 'ذهب' : 'جوهرة';
  const action = result.amount > 0 ? 'إضافة' : 'خصم';
  ApiResponse.success(res, result, `تمت ${action} ${Math.abs(result.amount)} ${currencyLabel}`);
});

const getAuditLog = asyncHandler(async (req, res) => {
  const { actions, meta } = await adminUserService.getAuditLog(req.query);
  ApiResponse.paginated(res, actions, meta.total, meta.page, meta.limit);
});

module.exports = { searchUsers, grantCurrency, getAuditLog };
