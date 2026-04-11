const questionService = require('../services/question.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const getQuestions = asyncHandler(async (req, res) => {
  const { questions, meta } = await questionService.getQuestions(req.query);
  ApiResponse.paginated(res, questions, meta.total, meta.page, meta.limit);
});

const getQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionById(req.params.id);
  ApiResponse.success(res, question);
});

const createQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(req.body);
  ApiResponse.success(res, question, '\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0633\u0624\u0627\u0644', 201);
});

const updateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(req.params.id, req.body);
  ApiResponse.success(res, question, '\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0633\u0624\u0627\u0644');
});

const deleteQuestion = asyncHandler(async (req, res) => {
  await questionService.deleteQuestion(req.params.id);
  ApiResponse.success(res, null, '\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0633\u0624\u0627\u0644');
});

const toggleActive = asyncHandler(async (req, res) => {
  const question = await questionService.toggleActive(req.params.id);
  ApiResponse.success(res, question, question.isActive ? '\u062A\u0645 \u0627\u0644\u062A\u0641\u0639\u064A\u0644' : '\u062A\u0645 \u0627\u0644\u062A\u0639\u0637\u064A\u0644');
});

const uploadExcel = asyncHandler(async (req, res) => {
  if (!req.file) return ApiResponse.error(res, '\u0627\u0644\u0645\u0644\u0641 \u0645\u0637\u0644\u0648\u0628', 400);
  const result = await questionService.uploadExcel(req.file.buffer);
  ApiResponse.success(res, result, `\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 ${result.created} \u0633\u0624\u0627\u0644`);
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) return ApiResponse.error(res, '\u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0637\u0644\u0648\u0628\u0629', 400);
  const imageUrl = `/uploads/questions/${req.file.filename}`;
  ApiResponse.success(res, { imageUrl }, '\u062A\u0645 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629');
});

const duplicateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.duplicateQuestion(req.params.id);
  ApiResponse.success(res, question, '\u062A\u0645 \u0646\u0633\u062E \u0627\u0644\u0633\u0624\u0627\u0644', 201);
});

const generateAi = asyncHandler(async (req, res) => {
  const result = await questionService.generateAi(req.body);
  ApiResponse.success(res, result, `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 ${result.created} \u0633\u0624\u0627\u0644 \u0628\u0648\u0627\u0633\u0637\u0629 AI`, 201);
});

const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = questionService.generateTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=saifiq-questions-template.xlsx');
  res.send(buffer);
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await questionService.getCategories();
  ApiResponse.success(res, categories);
});

const getDifficultyConfig = asyncHandler(async (req, res) => {
  const config = await questionService.getDifficultyConfig();
  ApiResponse.success(res, config);
});

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleActive,
  uploadExcel,
  uploadImage,
  duplicateQuestion,
  downloadTemplate,
  generateAi,
  getCategories,
  getDifficultyConfig,
};
