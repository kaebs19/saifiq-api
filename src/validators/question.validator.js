const Joi = require('joi');
const { CATEGORY_CONFIG } = require('../config/constants');

const categoryKeys = Object.keys(CATEGORY_CONFIG);

const optionSchema = Joi.object({
  text: Joi.string().min(1).required(),
  isCorrect: Joi.boolean().required(),
});

const createQuestionSchema = Joi.object({
  text: Joi.string().min(5).max(500).required().messages({
    'string.min': '\u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 5 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
    'string.max': '\u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u064A\u062C\u0628 \u0623\u0644\u0627 \u064A\u062A\u062C\u0627\u0648\u0632 500 \u062D\u0631\u0641',
    'any.required': '\u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u0645\u0637\u0644\u0648\u0628',
  }),
  type: Joi.string().valid('mcq', 'quick_input', 'numeric').required().messages({
    'any.only': '\u0646\u0648\u0639 \u0627\u0644\u0633\u0624\u0627\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 mcq, quick_input, \u0623\u0648 numeric',
    'any.required': '\u0646\u0648\u0639 \u0627\u0644\u0633\u0624\u0627\u0644 \u0645\u0637\u0644\u0648\u0628',
  }),
  category: Joi.string().valid(...categoryKeys).required().messages({
    'any.only': `\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646: ${categoryKeys.join(', ')}`,
    'any.required': '\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0645\u0637\u0644\u0648\u0628',
  }),
  options: Joi.when('type', {
    is: 'mcq',
    then: Joi.array().items(optionSchema).length(4).required().messages({
      'array.length': 'MCQ \u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 4 \u062E\u064A\u0627\u0631\u0627\u062A \u0628\u0627\u0644\u0636\u0628\u0637',
      'any.required': '\u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0623\u0633\u0626\u0644\u0629 MCQ',
    }),
    otherwise: Joi.forbidden(),
  }),
  correctAnswer: Joi.when('type', {
    is: Joi.string().valid('quick_input', 'numeric'),
    then: Joi.string().required().messages({
      'any.required': '\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0645\u0637\u0644\u0648\u0628\u0629',
    }),
    otherwise: Joi.forbidden(),
  }),
  numericTolerance: Joi.when('type', {
    is: 'numeric',
    then: Joi.number().min(0).required().messages({
      'any.required': '\u0647\u0627\u0645\u0634 \u0627\u0644\u062E\u0637\u0623 \u0645\u0637\u0644\u0648\u0628 \u0644\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0631\u0642\u0645\u064A\u0629',
    }),
    otherwise: Joi.forbidden(),
  }),
  imageUrl: Joi.string().allow('', null).optional(),
  hintText: Joi.string().allow('', null).optional(),
  timeLimitSeconds: Joi.number().integer().min(5).max(60).optional(),
  points: Joi.number().integer().min(1).max(100).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  source: Joi.string().valid('admin', 'ai', 'excel').optional(),
}).custom((value, helpers) => {
  // type-category check
  const config = CATEGORY_CONFIG[value.category];
  if (config && !config.types.includes(value.type)) {
    return helpers.error('any.custom', {
      message: `\u0646\u0648\u0639 "${value.type}" \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0641\u064A \u0642\u0633\u0645 "${config.label}". \u0627\u0644\u0645\u0633\u0645\u0648\u062D: ${config.types.join(', ')}`,
    });
  }

  // MCQ: unique options + exactly 1 correct
  if (value.type === 'mcq' && value.options) {
    const texts = value.options.map((o) => o.text.trim());
    if (new Set(texts).size !== texts.length) {
      return helpers.error('any.custom', { message: '\u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u062E\u062A\u0644\u0641\u0629 \u0639\u0646 \u0628\u0639\u0636' });
    }
    const correctCount = value.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      return helpers.error('any.custom', { message: 'MCQ \u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629 \u0648\u0627\u062D\u062F\u0629 \u0628\u0627\u0644\u0636\u0628\u0637' });
    }
  }

  // quick_input: answer must not be a number
  if (value.type === 'quick_input' && !isNaN(Number(value.correctAnswer))) {
    return helpers.error('any.custom', { message: '\u0625\u062C\u0627\u0628\u0629 Quick Input \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0646\u0635 \u0645\u0648 \u0631\u0642\u0645\u060C \u0627\u0633\u062A\u062E\u062F\u0645 numeric \u0644\u0644\u0623\u0631\u0642\u0627\u0645' });
  }

  // numeric: answer must be a number
  if (value.type === 'numeric' && isNaN(Number(value.correctAnswer))) {
    return helpers.error('any.custom', { message: '\u0625\u062C\u0627\u0628\u0629 Numeric \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0631\u0642\u0645' });
  }

  return value;
}).messages({
  'any.custom': '{{#message}}',
});

const updateQuestionSchema = createQuestionSchema.fork(
  ['text', 'type', 'category'],
  (field) => field.optional()
);

const generateAiSchema = Joi.object({
  category: Joi.string().valid(...categoryKeys).required(),
  type: Joi.string().valid('mcq', 'quick_input', 'numeric').required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  count: Joi.number().integer().min(1).max(10).default(5),
});

module.exports = { createQuestionSchema, updateQuestionSchema, generateAiSchema };
