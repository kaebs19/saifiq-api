/**
 * Fix ambiguous Hijri/Gregorian date questions.
 * Run once: node scripts/fix-hijri-questions.js
 */
require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Question } = require('../src/models');

const FIXES = [
  {
    oldText: 'في أي عام فُتحت مكة المكرمة؟',
    newText: 'في أي عام هجري فُتحت مكة المكرمة؟',
    correctAnswer: '8',
    numericTolerance: 0,
    difficulty: 'medium',
  },
  {
    oldText: 'في أي عام كانت معركة بدر؟',
    newText: 'في أي عام هجري كانت معركة بدر؟',
    correctAnswer: '2',
    numericTolerance: 0,
    difficulty: 'medium',
  },
];

const run = async () => {
  try {
    await connectDB();
    let updated = 0;

    for (const fix of FIXES) {
      const q = await Question.findOne({ where: { text: fix.oldText } });
      if (!q) {
        console.log(`⏭️  لم يُعثر على: ${fix.oldText}`);
        continue;
      }
      await q.update({
        text: fix.newText,
        correctAnswer: fix.correctAnswer,
        numericTolerance: fix.numericTolerance,
        difficulty: fix.difficulty,
      });
      console.log(`✅ تم تحديث: ${fix.newText} → ${fix.correctAnswer}`);
      updated++;
    }

    console.log(`\n📊 تم تحديث ${updated} سؤال`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
};

run();
