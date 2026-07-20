/**
 * Numeric-input question bank — ~106 Arabic questions across the 8 categories
 * that allow the `numeric` type (din/art/language/cinema/celebrities do not).
 *
 *   node scripts/seed-numeric-questions-v2.js
 *
 * `tol` is numericTolerance: 0 for exact facts, a margin for estimates
 * (the engine scores correct when |answer - correctAnswer| <= tolerance).
 * Idempotent: skips any question whose exact text already exists.
 */
require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Question } = require('../src/models');

const QUESTIONS = [
  // ── رياضيات ──
  { text: 'احسب ناتج: 15 × 4', answer: 60, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'احسب ناتج: 7 × 8', answer: 56, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'ما الجذر التربيعي للعدد 144؟', answer: 12, tol: 0, category: 'math', difficulty: 'medium' },
  { text: 'احسب ناتج: 100 ÷ 4', answer: 25, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'احسب ناتج: 12 + 15', answer: 27, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'اكتب عدد أضلاع المثلث بالأرقام', answer: 3, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'ما ناتج 9 مضروباً في نفسه؟', answer: 81, tol: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 25 × 4؟', answer: 100, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'ما ناتج 144 ÷ 12؟', answer: 12, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي مجموع زوايا المثلث بالدرجات؟', answer: 180, tol: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي مجموع زوايا المربع بالدرجات؟', answer: 360, tol: 0, category: 'math', difficulty: 'medium' },
  { text: 'ما الجذر التربيعي للعدد 81؟', answer: 9, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 13 × 3؟', answer: 39, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'ما ناتج 250 − 75؟', answer: 175, tol: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم عدد أضلاع المسدس؟', answer: 6, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 2 مرفوعاً للأس 10؟', answer: 1024, tol: 0, category: 'math', difficulty: 'hard' },
  { text: 'ما ناتج 45 + 55؟', answer: 100, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي نصف العدد 250؟', answer: 125, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'ما ناتج 11 × 11؟', answer: 121, tol: 0, category: 'math', difficulty: 'medium' },
  { text: 'كم عدد الدقائق في ساعتين؟', answer: 120, tol: 0, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي 20% من العدد 200؟', answer: 40, tol: 0, category: 'math', difficulty: 'medium' },

  // ── علوم ──
  { text: 'اكتب عدد كواكب المجموعة الشمسية بالأرقام', answer: 8, tol: 0, category: 'science', difficulty: 'easy' },
  { text: 'اكتب عدد عظام جسم الإنسان البالغ بالأرقام', answer: 206, tol: 0, category: 'science', difficulty: 'medium' },
  { text: 'ما درجة غليان الماء بالمئوية عند مستوى سطح البحر؟', answer: 100, tol: 0, category: 'science', difficulty: 'easy' },
  { text: 'ما درجة تجمّد الماء بالمئوية؟', answer: 0, tol: 0, category: 'science', difficulty: 'easy' },
  { text: 'كم تبلغ سرعة الضوء تقريباً بالكيلومتر في الثانية؟', answer: 300000, tol: 1000, category: 'science', difficulty: 'hard' },
  { text: 'كم عدد الكروموسومات في خلية الإنسان الطبيعية؟', answer: 46, tol: 0, category: 'science', difficulty: 'hard' },
  { text: 'ما العدد الذري لعنصر الأكسجين؟', answer: 8, tol: 0, category: 'science', difficulty: 'hard' },
  { text: 'ما العدد الذري لعنصر الكربون؟', answer: 6, tol: 0, category: 'science', difficulty: 'hard' },
  { text: 'كم عدد أقمار كوكب الأرض؟', answer: 1, tol: 0, category: 'science', difficulty: 'easy' },
  { text: 'كم دقيقة يستغرق ضوء الشمس للوصول إلى الأرض تقريباً؟', answer: 8, tol: 1, category: 'science', difficulty: 'hard' },
  { text: 'كم عدد حالات المادة الأساسية؟', answer: 3, tol: 0, category: 'science', difficulty: 'easy' },
  { text: 'كم يبلغ الرقم الهيدروجيني (pH) للماء النقي؟', answer: 7, tol: 0, category: 'science', difficulty: 'medium' },
  { text: 'كم عدد الذرات في جزيء الماء الواحد؟', answer: 3, tol: 0, category: 'science', difficulty: 'medium' },
  { text: 'كم يوماً تستغرق الأرض في دورة كاملة حول الشمس تقريباً؟', answer: 365, tol: 1, category: 'science', difficulty: 'easy' },
  { text: 'كم ساعة تستغرق الأرض في دورة كاملة حول نفسها؟', answer: 24, tol: 0, category: 'science', difficulty: 'easy' },

  // ── جغرافيا ──
  { text: 'اكتب عدد قارات العالم بالأرقام', answer: 7, tol: 0, category: 'geography', difficulty: 'easy' },
  { text: 'كم عدد الدول الأعضاء في جامعة الدول العربية؟', answer: 22, tol: 0, category: 'geography', difficulty: 'medium' },
  { text: 'كم عدد دول مجلس التعاون الخليجي؟', answer: 6, tol: 0, category: 'geography', difficulty: 'easy' },
  { text: 'كم عدد المحيطات في العالم؟', answer: 5, tol: 0, category: 'geography', difficulty: 'medium' },
  { text: 'كم يبلغ ارتفاع قمة إيفرست بالمتر تقريباً؟', answer: 8849, tol: 60, category: 'geography', difficulty: 'hard' },
  { text: 'كم عدد النجوم في علم الولايات المتحدة؟', answer: 50, tol: 0, category: 'geography', difficulty: 'medium' },
  { text: 'كم عدد المناطق الإدارية في المملكة العربية السعودية؟', answer: 13, tol: 0, category: 'geography', difficulty: 'medium' },
  { text: 'كم يبلغ طول نهر النيل تقريباً بالكيلومتر؟', answer: 6650, tol: 200, category: 'geography', difficulty: 'hard' },
  { text: 'كم عدد دول قارة أفريقيا؟', answer: 54, tol: 1, category: 'geography', difficulty: 'hard' },
  { text: 'كم ساعة يبلغ فرق التوقيت بين غرينتش والسعودية؟', answer: 3, tol: 0, category: 'geography', difficulty: 'medium' },
  { text: 'كم عدد درجات خطوط الطول حول الأرض؟', answer: 360, tol: 0, category: 'geography', difficulty: 'medium' },
  { text: 'كم تبلغ درجة خط الاستواء؟', answer: 0, tol: 0, category: 'geography', difficulty: 'medium' },
  { text: 'كم عدد ولايات الولايات المتحدة الأمريكية؟', answer: 50, tol: 0, category: 'geography', difficulty: 'medium' },

  // ── تاريخ ──
  { text: 'في أي عام ميلادي بدأت الحرب العالمية الثانية؟', answer: 1939, tol: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام ميلادي انتهت الحرب العالمية الثانية؟', answer: 1945, tol: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام ميلادي انتهت الحرب العالمية الأولى؟', answer: 1918, tol: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام ميلادي توحدت المملكة العربية السعودية؟', answer: 1932, tol: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام ميلادي هبط الإنسان على سطح القمر؟', answer: 1969, tol: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام ميلادي سقطت بغداد على يد المغول؟', answer: 1258, tol: 0, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام ميلادي غرقت سفينة تايتانيك؟', answer: 1912, tol: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام ميلادي وصل كولومبوس إلى أمريكا؟', answer: 1492, tol: 0, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام ميلادي سقط جدار برلين؟', answer: 1989, tol: 0, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام ميلادي وقعت معركة حطين؟', answer: 1187, tol: 0, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام ميلادي كانت الهجرة النبوية؟', answer: 622, tol: 0, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام ميلادي تأسست منظمة الأمم المتحدة؟', answer: 1945, tol: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي سنة هجرية وقعت غزوة بدر؟', answer: 2, tol: 0, category: 'tarikh', difficulty: 'hard' },

  // ── رياضة ──
  { text: 'كم عدد لاعبي فريق كرة القدم داخل الملعب؟', answer: 11, tol: 0, category: 'sport', difficulty: 'easy' },
  { text: 'اكتب عدد لاعبي فريق كرة السلة داخل الملعب بالأرقام', answer: 5, tol: 0, category: 'sport', difficulty: 'medium' },
  { text: 'كم عدد لاعبي فريق الكرة الطائرة داخل الملعب؟', answer: 6, tol: 0, category: 'sport', difficulty: 'medium' },
  { text: 'كم دقيقة يستغرق الوقت الأصلي لمباراة كرة القدم؟', answer: 90, tol: 0, category: 'sport', difficulty: 'easy' },
  { text: 'اكتب عدد السنوات الفاصلة بين نسختي كأس العالم', answer: 4, tol: 0, category: 'sport', difficulty: 'easy' },
  { text: 'في أي عام أُقيمت بطولة كأس العالم في قطر؟', answer: 2022, tol: 0, category: 'sport', difficulty: 'easy' },
  { text: 'كم عدد أشواط مباراة كرة القدم؟', answer: 2, tol: 0, category: 'sport', difficulty: 'easy' },
  { text: 'كم دقيقة يستغرق الشوط الواحد في كرة القدم؟', answer: 45, tol: 0, category: 'sport', difficulty: 'easy' },
  { text: 'كم عدد المنتخبات التي شاركت في كأس العالم 2022؟', answer: 32, tol: 0, category: 'sport', difficulty: 'medium' },
  { text: 'كم عدد الحلقات في شعار الألعاب الأولمبية؟', answer: 5, tol: 0, category: 'sport', difficulty: 'medium' },
  { text: 'كم عدد الحكام داخل أرض ملعب كرة القدم (الحكم ومساعداه)؟', answer: 3, tol: 0, category: 'sport', difficulty: 'medium' },
  { text: 'كم مرة فاز ميسي بجائزة الكرة الذهبية حتى عام 2023؟', answer: 8, tol: 0, category: 'sport', difficulty: 'hard' },

  // ── ثقافة عامة ──
  { text: 'اكتب عدد أيام الأسبوع بالأرقام', answer: 7, tol: 0, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد ساعات اليوم الواحد؟', answer: 24, tol: 0, category: 'general', difficulty: 'easy' },
  { text: 'اكتب عدد أشهر السنة الميلادية بالأرقام', answer: 12, tol: 0, category: 'general', difficulty: 'easy' },
  { text: 'اكتب عدد ألوان قوس قزح بالأرقام', answer: 7, tol: 0, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد أصابع اليدين معاً؟', answer: 10, tol: 0, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد الدقائق في الساعة الواحدة؟', answer: 60, tol: 0, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد الثواني في الدقيقة الواحدة؟', answer: 60, tol: 0, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد أيام السنة الميلادية العادية؟', answer: 365, tol: 0, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد أيام السنة الكبيسة؟', answer: 366, tol: 0, category: 'general', difficulty: 'medium' },
  { text: 'كم عدد أيام شهر فبراير في السنة الكبيسة؟', answer: 29, tol: 0, category: 'general', difficulty: 'medium' },
  { text: 'اكتب عدد حروف الهجاء العربية بالأرقام', answer: 28, tol: 0, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد أرجل العنكبوت؟', answer: 8, tol: 0, category: 'general', difficulty: 'medium' },

  // ── طب وصحة ──
  { text: 'اكتب عدد رئتي الإنسان بالأرقام', answer: 2, tol: 0, category: 'health', difficulty: 'easy' },
  { text: 'اكتب عدد أسنان الإنسان البالغ بالأرقام', answer: 32, tol: 0, category: 'health', difficulty: 'medium' },
  { text: 'اكتب عدد غرف القلب في الإنسان بالأرقام', answer: 4, tol: 0, category: 'health', difficulty: 'medium' },
  { text: 'كم لتراً من الدم في جسم الإنسان البالغ تقريباً؟', answer: 5, tol: 1, category: 'health', difficulty: 'medium' },
  { text: 'كم يبلغ معدل نبضات قلب البالغ في الدقيقة تقريباً؟', answer: 70, tol: 20, category: 'health', difficulty: 'medium' },
  { text: 'كم تبلغ درجة حرارة جسم الإنسان الطبيعية بالمئوية؟', answer: 37, tol: 1, category: 'health', difficulty: 'easy' },
  { text: 'كم عدد كليتي الإنسان؟', answer: 2, tol: 0, category: 'health', difficulty: 'easy' },
  { text: 'كم عدد فقرات العمود الفقري للإنسان البالغ؟', answer: 33, tol: 1, category: 'health', difficulty: 'hard' },
  { text: 'كم عدد ساعات النوم الموصى بها للبالغ يومياً؟', answer: 8, tol: 1, category: 'health', difficulty: 'easy' },
  { text: 'كم عدد أضلاع القفص الصدري للإنسان؟', answer: 24, tol: 0, category: 'health', difficulty: 'hard' },

  // ── تقنية ──
  { text: 'كم عدد البتات في البايت الواحد؟', answer: 8, tol: 0, category: 'tech', difficulty: 'medium' },
  { text: 'كم ميغابايت في الجيجابايت الواحد؟', answer: 1024, tol: 0, category: 'tech', difficulty: 'medium' },
  { text: 'كم كيلوبايت في الميغابايت الواحد؟', answer: 1024, tol: 0, category: 'tech', difficulty: 'medium' },
  { text: 'كم جيجابايت في التيرابايت الواحد؟', answer: 1024, tol: 0, category: 'tech', difficulty: 'medium' },
  { text: 'كم عدد الأرقام المستخدمة في النظام الثنائي؟', answer: 2, tol: 0, category: 'tech', difficulty: 'easy' },
  { text: 'في أي عام تأسست شركة جوجل؟', answer: 1998, tol: 0, category: 'tech', difficulty: 'hard' },
  { text: 'في أي عام تأسست شركة آبل؟', answer: 1976, tol: 0, category: 'tech', difficulty: 'hard' },
  { text: 'في أي عام أُطلق أول هاتف آيفون؟', answer: 2007, tol: 0, category: 'tech', difficulty: 'medium' },
  { text: 'في أي عام تأسس موقع فيسبوك؟', answer: 2004, tol: 0, category: 'tech', difficulty: 'medium' },
  { text: 'في أي عام تأسست شركة مايكروسوفت؟', answer: 1975, tol: 0, category: 'tech', difficulty: 'hard' },
];

const pointsFor = (d) => (d === 'easy' ? 10 : d === 'medium' ? 20 : 30);

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
        numericTolerance: q.tol,
        category: q.category,
        difficulty: q.difficulty,
        points: pointsFor(q.difficulty),
        timeLimitSeconds: 20,
        source: 'admin',
        isActive: true,
      });
      created++;
    }

    console.log(`✅ تم: ${created} سؤال إدخال رقمي جديد، ${skipped} متخطى`);
    console.log(`📊 المجموع الآن: ${await Question.count()} سؤال`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
};

seed();
