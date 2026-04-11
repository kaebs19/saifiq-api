const Anthropic = require('@anthropic-ai/sdk');
const AppError = require('../utils/AppError');
const { CATEGORY_CONFIG, DIFFICULTY_CONFIG } = require('../config/constants');

let client = null;
const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AppError('ANTHROPIC_API_KEY \u063A\u064A\u0631 \u0645\u0639\u062F\u0629', 500);
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
};

const TYPE_INSTRUCTIONS = {
  mcq: 'Each question must have exactly 4 options. Mark exactly one as correct via isCorrect:true. Format: { "type":"mcq", "text":"...", "options":[{"text":"A","isCorrect":true},{"text":"B","isCorrect":false},{"text":"C","isCorrect":false},{"text":"D","isCorrect":false}] }',
  quick_input: 'Each question expects a short Arabic text answer (NOT a number). Format: { "type":"quick_input", "text":"...", "correctAnswer":"..." }',
  numeric: 'Each question expects a numeric answer with a tolerance margin. Format: { "type":"numeric", "text":"...", "correctAnswer":"195", "numericTolerance":5 }',
};

const buildPrompt = ({ category, type, difficulty, count }) => {
  const cfg = CATEGORY_CONFIG[category];
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  return `\u0623\u0646\u0634\u0626 ${count} \u0623\u0633\u0626\u0644\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0644\u0644\u0639\u0628\u0629 \u062B\u0642\u0627\u0641\u064A\u0629.

Category: ${cfg.label} (${category})
Type: ${type}
Difficulty: ${diffCfg.label} (${difficulty})

Rules:
- All text in Arabic.
- Questions must be factually accurate.
- Difficulty "${difficulty}" means: ${difficulty === 'easy' ? 'general knowledge an average person would know' : difficulty === 'medium' ? 'requires some specific knowledge' : 'requires deep/specialized knowledge'}.
- ${TYPE_INSTRUCTIONS[type]}
- For category "\u062F\u064A\u0646" avoid controversial fiqh topics.
- Each question text 5-200 characters.
- For MCQ: all 4 options must be plausible but only one correct.

Output ONLY a JSON array of question objects, no markdown, no explanation. Example for ${count} questions:
[
  ${TYPE_INSTRUCTIONS[type].split('Format: ')[1]}${count > 1 ? ',\n  ...' : ''}
]`;
};

const parseQuestions = (text, type) => {
  // Strip markdown fences if present
  let clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    throw new AppError('\u0641\u0634\u0644 \u0641\u064A \u0642\u0631\u0627\u0621\u0629 \u0625\u062C\u0627\u0628\u0629 AI', 500);
  }
  if (!Array.isArray(parsed)) throw new AppError('AI \u0644\u0645 \u064A\u0631\u062C\u0639 \u0645\u0635\u0641\u0648\u0641\u0629', 500);
  return parsed.map((q) => ({ ...q, type }));
};

const generateQuestions = async ({ category, type, difficulty, count = 5 }) => {
  if (!CATEGORY_CONFIG[category]) throw new AppError('\u062A\u0635\u0646\u064A\u0641 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D', 400);
  if (!CATEGORY_CONFIG[category].types.includes(type)) {
    throw new AppError(`\u0646\u0648\u0639 "${type}" \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0641\u064A "${CATEGORY_CONFIG[category].label}"`, 400);
  }
  if (!DIFFICULTY_CONFIG[difficulty]) throw new AppError('\u0635\u0639\u0648\u0628\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629', 400);
  if (count < 1 || count > 10) throw new AppError('\u0627\u0644\u0639\u062F\u062F \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0628\u064A\u0646 1 \u0648 10', 400);

  let message;
  try {
    message = await getClient().messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildPrompt({ category, type, difficulty, count }) }],
    });
  } catch (err) {
    const apiMsg = err?.error?.error?.message || err?.message || '';
    if (/credit balance/i.test(apiMsg)) {
      throw new AppError('\u0631\u0635\u064A\u062F Anthropic \u063A\u064A\u0631 \u0643\u0627\u0641\u064A \u2014 \u0623\u0636\u0641 \u0631\u0635\u064A\u062F \u0641\u064A console.anthropic.com', 402);
    }
    if (/authentication|invalid.*key/i.test(apiMsg)) {
      throw new AppError('\u0645\u0641\u062A\u0627\u062D Anthropic \u063A\u064A\u0631 \u0635\u0627\u0644\u062D', 401);
    }
    if (/rate.?limit/i.test(apiMsg)) {
      throw new AppError('\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u062D\u062F \u0627\u0644\u0637\u0644\u0628\u0627\u062A\u060C \u062D\u0627\u0648\u0644 \u0644\u0627\u062D\u0642\u0627\u064B', 429);
    }
    throw new AppError(`\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0640 Anthropic: ${apiMsg}`, 500);
  }

  const text = message.content.find((b) => b.type === 'text')?.text || '';
  return parseQuestions(text, type);
};

module.exports = { generateQuestions };
