const itemService = require('../services/item.service');
const transactionService = require('../services/transaction.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const listItems = asyncHandler(async (req, res) => {
  const items = await itemService.listItems();
  ApiResponse.success(res, items);
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await itemService.updateItem(req.params.id, req.body);
  ApiResponse.success(res, item, '\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B');
});

const toggleItem = asyncHandler(async (req, res) => {
  const item = await itemService.toggleItem(req.params.id);
  ApiResponse.success(res, item, item.isActive ? '\u062A\u0645 \u0627\u0644\u062A\u0641\u0639\u064A\u0644' : '\u062A\u0645 \u0627\u0644\u062A\u0639\u0637\u064A\u0644');
});

const listTransactions = asyncHandler(async (req, res) => {
  const { transactions, meta } = await transactionService.listTransactions(req.query);
  ApiResponse.paginated(res, transactions, meta.total, meta.page, meta.limit);
});

module.exports = { listItems, updateItem, toggleItem, listTransactions };
