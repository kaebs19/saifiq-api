/**
 * Hard-delete ALL questions (and the RoundQuestion rows that reference them).
 *
 * RoundQuestion.questionId is a NOT NULL foreign key to Questions.id with no
 * ON DELETE rule, so every RoundQuestion must be removed before the Questions.
 * Both deletes run inside a single transaction (all-or-nothing).
 *
 * ⚠️ DESTRUCTIVE & IRREVERSIBLE. Dry-run by default; pass --yes to execute.
 *
 *   node scripts/delete-all-questions.js          # shows counts only (dry run)
 *   node scripts/delete-all-questions.js --yes     # actually deletes
 */
require('dotenv').config();
const { sequelize, Question, RoundQuestion } = require('../src/models');

const run = async () => {
  const confirmed = process.argv.includes('--yes');
  try {
    await sequelize.authenticate();

    const qCount = await Question.count();
    const rqCount = await RoundQuestion.count();
    console.log(`📊 قبل: Questions=${qCount} | RoundQuestions=${rqCount}`);

    if (!confirmed) {
      console.log('\n⚠️  هذا حذف نهائي لكل الأسئلة وكل سجلات جولات المباريات المرتبطة.');
      console.log('   للتنفيذ الفعلي أعد التشغيل مع --yes :');
      console.log('   node scripts/delete-all-questions.js --yes\n');
      process.exit(0);
    }

    await sequelize.transaction(async (t) => {
      const rqDeleted = await RoundQuestion.destroy({ where: {}, transaction: t });
      const qDeleted = await Question.destroy({ where: {}, transaction: t });
      console.log(`🗑️  حُذف: RoundQuestions=${rqDeleted} | Questions=${qDeleted}`);
    });

    console.log(`✅ بعد: Questions=${await Question.count()} | RoundQuestions=${await RoundQuestion.count()}`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
};

run();
