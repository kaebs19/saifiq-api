/**
 * Seed varied numeric questions for Castle Siege Phase 1.
 * Categories: dates, multiplication, addition, division, percentages, counts.
 *
 * Run: node scripts/seed-numeric-questions.js
 */
require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Question } = require('../src/models');

const QUESTIONS = [
  // ── تواريخ مهمة ──
  { text: 'في أي عام هجري فُتحت مكة المكرمة؟', answer: '8', tolerance: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام هجري كانت معركة بدر؟', answer: '2', tolerance: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام بُنيت الكعبة (على يد إبراهيم - تقريبي قبل الميلاد)؟', answer: '2000', tolerance: 200, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام سقطت الأندلس؟', answer: '1492', tolerance: 0, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام قامت ثورة 23 يوليو في مصر؟', answer: '1952', tolerance: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام تم اختراع المصباح الكهربائي؟', answer: '1879', tolerance: 2, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام تأسست منظمة أوبك؟', answer: '1960', tolerance: 0, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام تأسست شركة Microsoft؟', answer: '1975', tolerance: 0, category: 'tech', difficulty: 'hard' },
  { text: 'في أي عام تأسس Facebook؟', answer: '2004', tolerance: 0, category: 'tech', difficulty: 'medium' },
  { text: 'في أي عام أُطلق iPhone الأول؟', answer: '2007', tolerance: 0, category: 'tech', difficulty: 'medium' },
  { text: 'في أي عام أُسست رؤية المملكة 2030؟', answer: '2016', tolerance: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام انعقدت أولى دورات الألعاب الأولمبية الحديثة؟', answer: '1896', tolerance: 0, category: 'sport', difficulty: 'hard' },

  // ── ضرب ──
  { text: 'كم يساوي 8 × 9؟', answer: '72', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 13 × 7؟', answer: '91', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 14 × 14؟', answer: '196', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 25 × 8؟', answer: '200', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 16 × 6؟', answer: '96', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 11 × 12؟', answer: '132', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 17 × 3؟', answer: '51', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 99 × 9؟', answer: '891', tolerance: 0, category: 'math', difficulty: 'medium' },

  // ── جمع وطرح ──
  { text: 'كم يساوي 125 + 175؟', answer: '300', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 1000 - 357؟', answer: '643', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 248 + 367؟', answer: '615', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 50 + 75 + 125؟', answer: '250', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 1500 - 845؟', answer: '655', tolerance: 0, category: 'math', difficulty: 'medium' },

  // ── قسمة ──
  { text: 'كم يساوي 144 ÷ 12؟', answer: '12', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 84 ÷ 7؟', answer: '12', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 200 ÷ 8؟', answer: '25', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 360 ÷ 6؟', answer: '60', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 1000 ÷ 25؟', answer: '40', tolerance: 0, category: 'math', difficulty: 'medium' },

  // ── نسب مئوية ──
  { text: 'كم يساوي 10% من 500؟', answer: '50', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 25% من 800؟', answer: '200', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 50% من 240؟', answer: '120', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 30% من 1000؟', answer: '300', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 75% من 400؟', answer: '300', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 15% من 200؟', answer: '30', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 12.5% من 800؟', answer: '100', tolerance: 0, category: 'math', difficulty: 'hard' },

  // ── جذور وأسس ──
  { text: 'ما هو الجذر التربيعي لـ 225؟', answer: '15', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'ما هو الجذر التربيعي لـ 81؟', answer: '9', tolerance: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 2 أس 10؟', answer: '1024', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 5 أس 3؟', answer: '125', tolerance: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 10 أس 4؟', answer: '10000', tolerance: 0, category: 'math', difficulty: 'easy' },

  // ── جغرافيا (أعداد) ──
  { text: 'كم تقريباً عدد سكان السعودية بالمليون؟', answer: '34', tolerance: 3, category: 'geography', difficulty: 'medium' },
  { text: 'كم تقريباً عدد سكان مصر بالمليون؟', answer: '110', tolerance: 5, category: 'geography', difficulty: 'medium' },
  { text: 'كم ارتفاع جبل إفرست بالأمتار؟', answer: '8849', tolerance: 50, category: 'geography', difficulty: 'hard' },
  { text: 'كم تقريباً مساحة المملكة العربية السعودية بالكم2 (آلاف)؟', answer: '2150', tolerance: 100, category: 'geography', difficulty: 'hard' },
  { text: 'كم عدد الدول الأعضاء في جامعة الدول العربية؟', answer: '22', tolerance: 0, category: 'geography', difficulty: 'medium' },
  { text: 'كم عدد دول مجلس التعاون الخليجي؟', answer: '6', tolerance: 0, category: 'geography', difficulty: 'easy' },

  // ── دين (أعداد) ──
  { text: 'كم عدد آيات سورة الفاتحة؟', answer: '7', tolerance: 0, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد ركعات صلاة العشاء؟', answer: '4', tolerance: 0, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد ركعات صلاة المغرب؟', answer: '3', tolerance: 0, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد آيات سورة يس؟', answer: '83', tolerance: 1, category: 'din', difficulty: 'hard' },
  { text: 'كم عدد الأنبياء المذكورين بالاسم في القرآن؟', answer: '25', tolerance: 0, category: 'din', difficulty: 'medium' },
  { text: 'كم عدد أبواب الجنة؟', answer: '8', tolerance: 0, category: 'din', difficulty: 'medium' },
  { text: 'كم عدد أيام عشر ذي الحجة؟', answer: '10', tolerance: 0, category: 'din', difficulty: 'easy' },

  // ── علوم (أعداد) ──
  { text: 'كم عدد الأسنان عند الإنسان البالغ؟', answer: '32', tolerance: 0, category: 'science', difficulty: 'medium' },
  { text: 'كم درجة حرارة جسم الإنسان الطبيعية بالمئوية؟', answer: '37', tolerance: 1, category: 'science', difficulty: 'easy' },
  { text: 'كم عدد الكروموسومات في خلية الإنسان؟', answer: '46', tolerance: 0, category: 'science', difficulty: 'hard' },
  { text: 'ما الرقم الذري للأكسجين؟', answer: '8', tolerance: 0, category: 'science', difficulty: 'medium' },
  { text: 'كم تقريباً عمر الأرض بمليارات السنين؟', answer: '4.5', tolerance: 0.5, category: 'science', difficulty: 'hard' },
  { text: 'كم عدد عناصر الجدول الدوري المعروفة (تقريباً)؟', answer: '118', tolerance: 2, category: 'science', difficulty: 'hard' },

  // ── رياضة (أعداد) ──
  { text: 'كم سنة يُقام كأس العالم لكرة القدم؟', answer: '4', tolerance: 0, category: 'sport', difficulty: 'easy' },
  { text: 'كم بطولة كأس عالم فاز بها البرازيل؟', answer: '5', tolerance: 0, category: 'sport', difficulty: 'medium' },
  { text: 'كم متراً طول حوض السباحة الأولمبي؟', answer: '50', tolerance: 0, category: 'sport', difficulty: 'medium' },
  { text: 'كم لاعب أساسي في فريق كرة الطائرة؟', answer: '6', tolerance: 0, category: 'sport', difficulty: 'easy' },
];

const seed = async () => {
  try {
    await connectDB();

    let created = 0;
    let skipped = 0;

    for (const q of QUESTIONS) {
      const existing = await Question.findOne({ where: { text: q.text } });
      if (existing) { skipped++; continue; }

      await Question.create({
        text: q.text,
        type: 'numeric',
        correctAnswer: String(q.answer),
        numericTolerance: q.tolerance ?? 0,
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
    console.log(`ℹ️  Phase 1 يحتاج numeric فقط — متوفر: ${totals.numeric}`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
};

seed();
