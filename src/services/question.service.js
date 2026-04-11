const { Op } = require('sequelize');
const XLSX = require('xlsx');
const { Question } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, getPageMeta } = require('../utils/pagination');
const { CATEGORY_CONFIG, DIFFICULTY_CONFIG } = require('../config/constants');
const { deleteUpload } = require('../config/upload');
const aiService = require('./ai.service');

// ── Helpers ──

const applyDefaults = (data) => {
  const catConfig = CATEGORY_CONFIG[data.category];
  if (!catConfig) return data;

  if (!data.difficulty) {
    data.difficulty = catConfig.defaultDifficulty;
  }

  const diffConfig = DIFFICULTY_CONFIG[data.difficulty] || DIFFICULTY_CONFIG.easy;

  if (!data.points) {
    data.points = diffConfig.points;
  }
  if (!data.timeLimitSeconds) {
    data.timeLimitSeconds = diffConfig.baseTime + catConfig.extraTime;
  }
  return data;
};

const validateQuestionData = (data) => {
  const config = CATEGORY_CONFIG[data.category];
  if (config && !config.types.includes(data.type)) {
    throw new AppError(
      `\u0646\u0648\u0639 "${data.type}" \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0641\u064A \u0642\u0633\u0645 "${config.label}". \u0627\u0644\u0645\u0633\u0645\u0648\u062D: ${config.types.join(', ')}`,
      422
    );
  }
  if (data.type === 'mcq') {
    const correctCount = data.options?.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new AppError('MCQ \u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629 \u0648\u0627\u062D\u062F\u0629 \u0628\u0627\u0644\u0636\u0628\u0637', 422);
    }
  }
  if (data.type === 'numeric' && isNaN(Number(data.correctAnswer))) {
    throw new AppError('\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0631\u0642\u0645', 422);
  }
};

// ── Query ──

const getQuestions = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (query.type) where.type = query.type;
  if (query.category) where.category = query.category;
  if (query.difficulty) where.difficulty = query.difficulty;
  if (query.source) where.source = query.source;
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
  if (query.search) where.text = { [Op.iLike]: `%${query.search}%` };

  const { count, rows } = await Question.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return { questions: rows, meta: getPageMeta(count, page, limit) };
};

const getQuestionById = async (id) => {
  const question = await Question.findByPk(id);
  if (!question) throw new AppError('\u0627\u0644\u0633\u0624\u0627\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F', 404);
  return question;
};

// ── Create ──

const createQuestion = async (data) => {
  validateQuestionData(data);
  applyDefaults(data);
  return Question.create({ ...data, source: data.source || 'admin' });
};

// ── Update ──

const updateQuestion = async (id, data) => {
  const question = await getQuestionById(id);
  const merged = { ...question.toJSON(), ...data };
  validateQuestionData(merged);

  if (data.imageUrl !== undefined && question.imageUrl && question.imageUrl !== data.imageUrl) {
    deleteUpload(question.imageUrl);
  }

  await question.update(data);
  return question;
};

// ── Delete ──

const deleteQuestion = async (id) => {
  const question = await getQuestionById(id);
  if (question.imageUrl) deleteUpload(question.imageUrl);
  await question.destroy();
};

// ── Toggle Active ──

const toggleActive = async (id) => {
  const question = await getQuestionById(id);
  await question.update({ isActive: !question.isActive });
  return question;
};

// ── Excel Upload ──

const uploadExcel = async (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  if (!rows.length) throw new AppError('\u0627\u0644\u0645\u0644\u0641 \u0641\u0627\u0631\u063A', 400);

  const questions = [];
  const errors = [];

  rows.forEach((row, i) => {
    try {
      const q = parseExcelRow(row);
      validateQuestionData(q);
      applyDefaults(q);
      questions.push(q);
    } catch (err) {
      errors.push(`\u0633\u0637\u0631 ${i + 2}: ${err.message}`);
    }
  });

  let created = [];
  if (questions.length) {
    created = await Question.bulkCreate(questions);
  }

  return { created: created.length, errors };
};

// ── Excel Parser ──

const parseExcelRow = (row) => {
  const type = (row.type || row['\u0627\u0644\u0646\u0648\u0639'] || 'mcq').toLowerCase().trim();
  const text = row.text || row['\u0627\u0644\u0633\u0624\u0627\u0644'];
  const category = row.category || row['\u0627\u0644\u062A\u0635\u0646\u064A\u0641'];

  if (!text) throw new Error('\u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u0645\u0637\u0644\u0648\u0628');
  if (!category) throw new Error('\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0645\u0637\u0644\u0648\u0628');
  if (!CATEGORY_CONFIG[category]) throw new Error(`\u062A\u0635\u0646\u064A\u0641 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641: ${category}`);

  const base = {
    text,
    type,
    category,
    difficulty: row.difficulty || row['\u0627\u0644\u0635\u0639\u0648\u0628\u0629'] || null,
    hintText: row.hint || row.hintText || row['\u0627\u0644\u062A\u0644\u0645\u064A\u062D'] || null,
    timeLimitSeconds: Number(row.timeLimitSeconds || row['\u0627\u0644\u0648\u0642\u062A']) || null,
    points: Number(row.points || row['\u0627\u0644\u0646\u0642\u0627\u0637']) || null,
    source: 'excel',
  };

  if (type === 'mcq') {
    const options = [];
    for (let n = 1; n <= 6; n++) {
      const val = row[`option${n}`] || row[`\u062E\u064A\u0627\u0631${n}`];
      if (val) options.push({ text: String(val).trim(), isCorrect: false });
    }
    const correctIdx = Number(row.correctOption || row['\u0627\u0644\u0635\u062D\u064A\u062D']) - 1;
    if (isNaN(correctIdx) || !options[correctIdx]) throw new Error('\u0631\u0642\u0645 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D');
    options[correctIdx].isCorrect = true;
    base.options = options;
  } else if (type === 'quick_input') {
    base.correctAnswer = String(row.correctAnswer || row['\u0627\u0644\u0625\u062C\u0627\u0628\u0629'] || '');
    if (!base.correctAnswer) throw new Error('\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0645\u0637\u0644\u0648\u0628\u0629');
  } else if (type === 'numeric') {
    base.correctAnswer = String(row.correctAnswer || row['\u0627\u0644\u0625\u062C\u0627\u0628\u0629'] || '');
    base.numericTolerance = Number(row.tolerance || row.numericTolerance || row['\u0627\u0644\u0647\u0627\u0645\u0634']) || 0;
    if (!base.correctAnswer) throw new Error('\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0645\u0637\u0644\u0648\u0628\u0629');
  } else {
    throw new Error(`\u0646\u0648\u0639 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641: ${type}`);
  }

  return base;
};

// ── Duplicate ──

const duplicateQuestion = async (id) => {
  const original = await getQuestionById(id);
  const data = original.toJSON();
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  data.text = `${data.text} (\u0646\u0633\u062E\u0629)`;
  data.timesUsed = 0;
  data.timesCorrect = 0;
  return Question.create(data);
};

// ── Excel Template ──

const generateTemplate = () => {
  const wb = XLSX.utils.book_new();

  const headers = [
    'text', 'type', 'category', 'difficulty',
    'option1', 'option2', 'option3', 'option4', 'correctOption',
    'correctAnswer', 'tolerance', 'hint',
  ];

  const examples = [
    ['\u0645\u0627 \u0639\u0627\u0635\u0645\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F', 'mcq', 'geography', 'easy', '\u0627\u0644\u0631\u064A\u0627\u0636', '\u062C\u062F\u0629', '\u0645\u0643\u0629', '\u0627\u0644\u062F\u0645\u0627\u0645', 1, '', '', ''],
    ['\u0623\u0637\u0648\u0644 \u0646\u0647\u0631 \u0628\u0627\u0644\u0639\u0627\u0644\u0645\u061F', 'quick_input', 'geography', 'medium', '', '', '', '', '', '\u0627\u0644\u0646\u064A\u0644', '', '\u0623\u0641\u0631\u064A\u0642\u064A\u0627'],
    ['\u0643\u0645 \u0639\u062F\u062F \u062F\u0648\u0644 \u0627\u0644\u0639\u0627\u0644\u0645\u061F', 'numeric', 'general', 'hard', '', '', '', '', '', '195', 5, '+190'],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);
  ws['!cols'] = headers.map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

// ── AI Generation ──

const generateAi = async ({ category, type, difficulty, count }) => {
  const generated = await aiService.generateQuestions({ category, type, difficulty, count });

  const valid = [];
  const errors = [];

  for (const [i, q] of generated.entries()) {
    try {
      const data = { ...q, category, type, difficulty, source: 'ai' };
      validateQuestionData(data);
      applyDefaults(data);
      valid.push(data);
    } catch (err) {
      errors.push(`\u0633\u0624\u0627\u0644 ${i + 1}: ${err.message}`);
    }
  }

  let created = [];
  if (valid.length) {
    created = await Question.bulkCreate(valid);
  }

  return { created: created.length, errors, questions: created };
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleActive,
  uploadExcel,
  duplicateQuestion,
  generateTemplate,
  generateAi,
  getCategories: async () => CATEGORY_CONFIG,
  getDifficultyConfig: async () => DIFFICULTY_CONFIG,
};
