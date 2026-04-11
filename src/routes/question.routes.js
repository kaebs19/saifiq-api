const { Router } = require('express');
const multer = require('multer');
const {
  getQuestions, getQuestion, createQuestion, updateQuestion,
  deleteQuestion, toggleActive, uploadExcel, uploadImage, duplicateQuestion,
  downloadTemplate, generateAi, getCategories, getDifficultyConfig,
} = require('../controllers/question.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createQuestionSchema, updateQuestionSchema, generateAiSchema } = require('../validators/question.validator');
const { createImageUploader } = require('../config/upload');
const { aiLimiter } = require('../middleware/rateLimit');

const excelUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const imageUpload = createImageUploader('questions');
const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/category-config', getCategories);
router.get('/difficulty-config', getDifficultyConfig);
router.get('/template', downloadTemplate);
router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.post('/', validate(createQuestionSchema), createQuestion);
router.put('/:id', validate(updateQuestionSchema), updateQuestion);
router.delete('/:id', deleteQuestion);
router.patch('/:id/toggle', toggleActive);
router.post('/:id/duplicate', duplicateQuestion);
router.post('/upload-excel', excelUpload.single('file'), uploadExcel);
router.post('/upload-image', imageUpload.single('image'), uploadImage);
router.post('/generate-ai', aiLimiter, validate(generateAiSchema), generateAi);

module.exports = router;
