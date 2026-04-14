const itemService = require('../services/item.service');
const transactionService = require('../services/transaction.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// ── Admin endpoints ──

const listItems = asyncHandler(async (req, res) => {
  const items = await itemService.listItems();
  ApiResponse.success(res, items);
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await itemService.updateItem(req.params.id, req.body);
  ApiResponse.success(res, item, 'تم التحديث');
});

const toggleItem = asyncHandler(async (req, res) => {
  const item = await itemService.toggleItem(req.params.id);
  ApiResponse.success(res, item, item.isActive ? 'تم التفعيل' : 'تم التعطيل');
});

const listTransactions = asyncHandler(async (req, res) => {
  const { transactions, meta } = await transactionService.listTransactions(req.query);
  ApiResponse.paginated(res, transactions, meta.total, meta.page, meta.limit);
});

// ── Player endpoints ──

const listActiveItems = asyncHandler(async (req, res) => {
  const items = await itemService.listActiveItems();
  ApiResponse.success(res, items);
});

const buyItem = asyncHandler(async (req, res) => {
  const result = await itemService.buyItem(req.user.id, req.params.itemType);
  ApiResponse.success(res, result, 'تم الشراء بنجاح');
});

const getInventory = asyncHandler(async (req, res) => {
  const inventory = await itemService.getInventory(req.user.id);
  ApiResponse.success(res, inventory);
});

module.exports = { listItems, updateItem, toggleItem, listTransactions, listActiveItems, buyItem, getInventory };
