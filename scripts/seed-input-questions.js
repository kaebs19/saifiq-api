/**
 * Seed input-type questions for Castle Siege (1v1) mode.
 * Numeric: years, counts, percentages — supports tolerance for "closest" scoring
 * Text: short factual answers (city, name)
 *
 * Run: node scripts/seed-input-questions.js
 */
require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Question } = require('../src/models');

const QUESTIONS = [
  // ── Numeric: history (good for closest) ──
  { text: 'في أي عام كانت الحرب العالمية الأولى؟', answer: '1914', tolerance: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام بدأت الحرب العالمية الثانية؟', answer: '1939', tolerance: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام توحدت المملكة العربية السعودية؟', answer: '1932', tolerance: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام نزل الإنسان على القمر؟', answer: '1969', tolerance: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام تأسست شركة Apple؟', answer: '1976', tolerance: 0, category: 'tech', difficulty: 'hard' },
  { text: 'في أي عام تأسست شركة Google؟', answer: '1998', tolerance: 0, category: 'tech', difficulty: 'hard' },
  { text: 'في أي عام تأسست منظمة الأمم المتحدة؟', answer: '1945', tolerance: 0, category: 'tarikh', difficulty: 'hard' },

  // ── Numeric: religion ──
  { text: 'كم عدد سور القرآن الكريم؟', answer: '114', tolerance: 0, category: 'din', difficulty: 'medium' },
  { text: 'كم عدد آيات سورة البقرة؟', answer: '286', tolerance: 0, category: 'din', difficulty: 'hard' },
  { text: 'كم عدد ركعات صلاة الفجر؟', answer: '2', tolerance: 0, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد ركعات صلاة الظهر؟', answer: '4', tolerance: 0, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد أركان الإسلام؟', answer: '5', tolerance: 0, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد أيام شهر رمضان (هجري)؟', answer: '30', tolerance: 1, category: 'din', difficulty: 'medium' },

  // ── Numeric: science ──
  { text: 'كم عدد كواكب المجموعة الشمسية؟', answer: '8', tolerance: 0, category: 'science', difficulty: 'easy' },
  { text: 'كم عدد عظام جسم الإنسان البالغ؟', answer: '206', tolerance: 5, category: 'science', difficulty: 'hard' },
  { text: 'كم عدد القلب في غرف الإنسان؟', answer: '4', tolerance: 0, category: 'science', difficulty: 'easy' },
  { text: 'ما درجة غليان الماء بالمئوية؟', answer: '100', tolerance: 0, category: 'science', difficulty: 'easy' },
  { text: 'ما درجة تجمد الماء بالمئوية؟', answer: '0', tolerance: 0, category: 'science', difficulty: 'easy' },
  { text: 'كم تقريباً سرعة الضوء (كم/ث)؟', answer: '300000', tolerance: 5000, category: 'science', difficulty: 'hard' },

  // ── Numeric: math ──
  { text: 'كم يساوي 12 × 12؟', answer: '144', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 25 × 4؟', answer: '100', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'ما هو الجذر التربيعي لـ 169؟', answer: '13', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 7 × 9؟', answer: '63', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 15 + 27؟', answer: '42', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'ما هو 20% من 250؟', answer: '50', tolerance: 0, category: 'math', difficulty: 'medium' },

  // ── Numeric: geography ──
  { text: 'كم عدد قارات العالم؟', answer: '7', tolerance: 0, category: 'geography', difficulty: 'easy' },
  { text: 'كم عدد محيطات العالم؟', answer: '5', tolerance: 0, category: 'geography', difficulty: 'medium' },
  { text: 'كم عدد دول العالم تقريباً؟', answer: '195', tolerance: 5, category: 'geography', difficulty: 'hard' },

  // ── Numeric: sports ──
  { text: 'كم عدد لاعبي فريق كرة القدم؟', answer: '11', tolerance: 0, category: 'sport', difficulty: 'easy' },
  { text: 'كم عدد لاعبي فريق كرة السلة؟', answer: '5', tolerance: 0, category: 'sport', difficulty: 'easy' },
  { text: 'كم دقيقة في شوط كرة قدم؟', answer: '45', tolerance: 0, category: 'sport', difficulty: 'easy' },

  // ── Text: geography ──
  { text: 'ما عاصمة فرنسا؟', answer: 'باريس', category: 'geography', difficulty: 'easy' },
  { text: 'ما عاصمة المملكة العربية السعودية؟', answer: 'الرياض', category: 'geography', difficulty: 'easy' },
  { text: 'ما عاصمة مصر؟', answer: 'القاهرة', category: 'geography', difficulty: 'easy' },
  { text: 'ما عاصمة اليابان؟', answer: 'طوكيو', category: 'geography', difficulty: 'medium' },
  { text: 'ما عاصمة إيطاليا؟', answer: 'روما', category: 'geography', difficulty: 'easy' },
  { text: 'ما عاصمة ألمانيا؟', answer: 'برلين', category: 'geography', difficulty: 'medium' },
  { text: 'ما أكبر دولة عربية مساحة؟', answer: 'الجزائر', category: 'geography', difficulty: 'medium' },
  { text: 'ما اسم أطول نهر في العالم؟', answer: 'الأمازون', category: 'geography', difficulty: 'medium' },

  // ── Text: misc ──
  { text: 'من رسم لوحة الموناليزا؟', answer: 'دافنشي', category: 'art', difficulty: 'medium' },
  { text: 'من مؤسس شركة Apple؟', answer: 'ستيف جوبز', category: 'tech', difficulty: 'easy' },
  { text: 'ما الحيوان المعروف بـ"ملك الغابة"؟', answer: 'الأسد', category: 'general', difficulty: 'easy' },
  { text: 'ما اسم الكوكب الأحمر؟', answer: 'المريخ', category: 'science', difficulty: 'easy' },
];

const seed = async () => {
  try {
    await connectDB();

    let created = 0;
    let skipped = 0;

    for (const q of QUESTIONS) {
      const existing = await Question.findOne({ where: { text: q.text } });
      if (existing) { skipped++; continue; }

      const isNumeric = /^-?\d+(\.\d+)?$/.test(String(q.answer).trim());
      await Question.create({
        text: q.text,
        type: isNumeric ? 'numeric' : 'quick_input',
        correctAnswer: String(q.answer),
        numericTolerance: isNumeric ? (q.tolerance || 0) : null,
        category: q.category,
        difficulty: q.difficulty,
        points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 20 : 30,
        timeLimitSeconds: 15,
        source: 'admin',
        isActive: true,
      });
      created++;
    }

    const totals = {
      total: await Question.count(),
      numeric: await Question.count({ where: { type: 'numeric' } }),
      input: await Question.count({ where: { type: 'quick_input' } }),
      mcq: await Question.count({ where: { type: 'mcq' } }),
    };

    console.log(`✅ تم: ${created} سؤال جديد، ${skipped} متخطى`);
    console.log(`📊 المجاميع: numeric=${totals.numeric} | text=${totals.input} | mcq=${totals.mcq} | total=${totals.total}`);
    console.log(`ℹ️  Castle Siege يحتاج ≥14 سؤال input/numeric — متوفر: ${totals.numeric + totals.input}`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
};

seed();
