require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Question } = require('../src/models');

// أسئلة عينة — 40 سؤال موزّعة على التصنيفات
const QUESTIONS = [
  // ── جغرافيا (easy) ──
  { text: 'ما هي عاصمة المملكة العربية السعودية؟', options: ['جدة', 'الرياض', 'مكة', 'الدمام'], correct: 1, category: 'geography', difficulty: 'easy' },
  { text: 'ما هي عاصمة مصر؟', options: ['الإسكندرية', 'الأقصر', 'القاهرة', 'أسوان'], correct: 2, category: 'geography', difficulty: 'easy' },
  { text: 'أي من التالية ليست قارة؟', options: ['آسيا', 'أوروبا', 'جرينلاند', 'أستراليا'], correct: 2, category: 'geography', difficulty: 'easy' },
  { text: 'ما هو أطول نهر في العالم؟', options: ['النيل', 'الأمازون', 'المسيسيبي', 'اليانغتسي'], correct: 1, category: 'geography', difficulty: 'medium' },
  { text: 'ما هي عاصمة فرنسا؟', options: ['لندن', 'باريس', 'برلين', 'مدريد'], correct: 1, category: 'geography', difficulty: 'easy' },
  { text: 'ما هي أكبر صحراء في العالم؟', options: ['الصحراء الكبرى', 'القطب الجنوبي', 'صحراء جوبي', 'الربع الخالي'], correct: 1, category: 'geography', difficulty: 'hard' },

  // ── ثقافة عامة (easy) ──
  { text: 'كم عدد ألوان قوس قزح؟', options: ['5', '6', '7', '8'], correct: 2, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد أيام الأسبوع؟', options: ['5', '6', '7', '8'], correct: 2, category: 'general', difficulty: 'easy' },
  { text: 'ما لون السماء في يوم صافٍ؟', options: ['أخضر', 'أحمر', 'أزرق', 'أصفر'], correct: 2, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد ساعات اليوم؟', options: ['12', '18', '24', '30'], correct: 2, category: 'general', difficulty: 'easy' },

  // ── علوم (medium) ──
  { text: 'ما هو الرمز الكيميائي للذهب؟', options: ['Au', 'Ag', 'Gd', 'Go'], correct: 0, category: 'science', difficulty: 'medium' },
  { text: 'كم عدد كواكب المجموعة الشمسية؟', options: ['7', '8', '9', '10'], correct: 1, category: 'science', difficulty: 'easy' },
  { text: 'ما هو أكبر كوكب في المجموعة الشمسية؟', options: ['زحل', 'المريخ', 'المشتري', 'الأرض'], correct: 2, category: 'science', difficulty: 'easy' },
  { text: 'ما هي الوحدة الأساسية للحياة؟', options: ['الذرة', 'الخلية', 'الجزيء', 'النواة'], correct: 1, category: 'science', difficulty: 'medium' },
  { text: 'من مكتشف قانون الجاذبية؟', options: ['أينشتاين', 'نيوتن', 'غاليليو', 'تسلا'], correct: 1, category: 'science', difficulty: 'medium' },
  { text: 'ما هو الغاز الذي يتنفسه الإنسان؟', options: ['النيتروجين', 'الأكسجين', 'الهيدروجين', 'ثاني أكسيد الكربون'], correct: 1, category: 'science', difficulty: 'easy' },

  // ── تاريخ (medium) ──
  { text: 'في أي عام بدأت الحرب العالمية الثانية؟', options: ['1935', '1939', '1941', '1945'], correct: 1, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام توحدت المملكة العربية السعودية؟', options: ['1932', '1945', '1950', '1960'], correct: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'من هو مؤسس الدولة السعودية الأولى؟', options: ['الملك عبدالعزيز', 'الإمام محمد بن سعود', 'الإمام تركي', 'الملك فيصل'], correct: 1, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي قرن ظهر الإسلام؟', options: ['السادس', 'السابع', 'الثامن', 'التاسع'], correct: 1, category: 'tarikh', difficulty: 'medium' },

  // ── دين (medium) ──
  { text: 'كم عدد أركان الإسلام؟', options: ['4', '5', '6', '7'], correct: 1, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد السور في القرآن الكريم؟', options: ['100', '110', '114', '120'], correct: 2, category: 'din', difficulty: 'medium' },
  { text: 'في أي شهر يصوم المسلمون؟', options: ['شعبان', 'رمضان', 'شوال', 'ذو الحجة'], correct: 1, category: 'din', difficulty: 'easy' },
  { text: 'ما اسم الرسول الكريم ﷺ؟', options: ['موسى', 'عيسى', 'محمد', 'إبراهيم'], correct: 2, category: 'din', difficulty: 'easy' },

  // ── رياضة (easy) ──
  { text: 'كم عدد لاعبي فريق كرة القدم؟', options: ['9', '10', '11', '12'], correct: 2, category: 'sport', difficulty: 'easy' },
  { text: 'أين أُقيم كأس العالم 2022؟', options: ['روسيا', 'قطر', 'البرازيل', 'ألمانيا'], correct: 1, category: 'sport', difficulty: 'easy' },
  { text: 'كم مرة فاز ميسي بالكرة الذهبية (حتى 2023)؟', options: ['5', '6', '7', '8'], correct: 3, category: 'sport', difficulty: 'hard' },
  { text: 'ما الرياضة الملقّبة بـ "اللعبة الجميلة"؟', options: ['التنس', 'كرة القدم', 'السلة', 'الكريكيت'], correct: 1, category: 'sport', difficulty: 'easy' },

  // ── فن ──
  { text: 'من رسم لوحة الموناليزا؟', options: ['بيكاسو', 'دافنشي', 'فان جوخ', 'رامبرانت'], correct: 1, category: 'art', difficulty: 'medium' },
  { text: 'من مؤلف مسرحية روميو وجولييت؟', options: ['ديكنز', 'شكسبير', 'همنغواي', 'تولستوي'], correct: 1, category: 'art', difficulty: 'medium' },
  { text: 'ما اسم أشهر رسّام لـ"الليلة المرصعة بالنجوم"؟', options: ['فان جوخ', 'مونيه', 'مانيه', 'دالي'], correct: 0, category: 'art', difficulty: 'hard' },

  // ── تقنية (hard) ──
  { text: 'ما هو اختصار HTML؟', options: ['Hyperlinks and Text Markup', 'Hyper Text Markup Language', 'Home Tool Markup Language', 'None'], correct: 1, category: 'tech', difficulty: 'medium' },
  { text: 'من هو مؤسس شركة Apple؟', options: ['بيل غيتس', 'ستيف جوبز', 'إيلون ماسك', 'مارك زوكربرغ'], correct: 1, category: 'tech', difficulty: 'easy' },
  { text: 'في أي عام تأسست شركة Google؟', options: ['1996', '1998', '2000', '2004'], correct: 1, category: 'tech', difficulty: 'hard' },
  { text: 'ما هي لغة البرمجة المستخدمة في iOS؟', options: ['Java', 'Swift', 'Python', 'C#'], correct: 1, category: 'tech', difficulty: 'medium' },

  // ── لغة ──
  { text: 'ما جمع كلمة "كتاب"؟', options: ['كتابان', 'كتب', 'مكاتب', 'كتّاب'], correct: 1, category: 'language', difficulty: 'easy' },
  { text: 'ما ضد كلمة "ليل"؟', options: ['مساء', 'ظلام', 'نهار', 'فجر'], correct: 2, category: 'language', difficulty: 'easy' },
  { text: 'كم عدد حروف الهجاء في اللغة العربية؟', options: ['26', '28', '30', '32'], correct: 1, category: 'language', difficulty: 'easy' },

  // ── رياضيات (hard) ──
  { text: 'كم يساوي 15 × 4؟', options: ['50', '60', '65', '70'], correct: 1, category: 'math', difficulty: 'easy' },
  { text: 'ما هو الجذر التربيعي لـ 144؟', options: ['10', '11', '12', '14'], correct: 2, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 7 × 8؟', options: ['54', '56', '58', '64'], correct: 1, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي π تقريباً؟', options: ['2.71', '3.14', '3.45', '4.00'], correct: 1, category: 'math', difficulty: 'medium' },
];

const seed = async () => {
  try {
    await connectDB();

    const count = await Question.count();
    if (count > 0) {
      console.log(`⚠️  يوجد ${count} سؤال بالفعل — هل تريد الإضافة فوقهم؟`);
      console.log('    سيتم تخطي الأسئلة المكررة (نفس النص).');
    }

    let created = 0;
    let skipped = 0;

    for (const q of QUESTIONS) {
      const existing = await Question.findOne({ where: { text: q.text } });
      if (existing) { skipped++; continue; }

      const options = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correct }));
      await Question.create({
        text: q.text,
        type: 'mcq',
        options,
        category: q.category,
        difficulty: q.difficulty,
        points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 20 : 30,
        timeLimitSeconds: 15,
        source: 'admin',
        isActive: true,
      });
      created++;
    }

    console.log(`✅ تم: ${created} سؤال جديد، ${skipped} متخطى`);
    console.log(`📊 المجموع الآن: ${await Question.count()} سؤال`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
};

seed();
