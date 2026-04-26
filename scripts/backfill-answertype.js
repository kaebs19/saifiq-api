/**
 * Backfill answerType column for existing questions.
 * Maps internal `type` to spec's `answerType`:
 *   numeric → numericInput
 *   quick_input → textInput
 *   mcq → multipleChoice
 *
 * Run: node scripts/backfill-answertype.js
 */
require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Question, sequelize } = require('../src/models');

const run = async () => {
  try {
    await connectDB();

    const [, n1] = await sequelize.query(`UPDATE "Questions" SET "answerType" = 'numericInput' WHERE "type" = 'numeric'`);
    const [, n2] = await sequelize.query(`UPDATE "Questions" SET "answerType" = 'textInput' WHERE "type" = 'quick_input'`);
    const [, n3] = await sequelize.query(`UPDATE "Questions" SET "answerType" = 'multipleChoice' WHERE "type" = 'mcq'`);

    const counts = {
      numericInput: await Question.count({ where: { answerType: 'numericInput' } }),
      textInput: await Question.count({ where: { answerType: 'textInput' } }),
      multipleChoice: await Question.count({ where: { answerType: 'multipleChoice' } }),
    };

    console.log('✅ Backfill done');
    console.log(`📊 ${JSON.stringify(counts)}`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
};

run();
