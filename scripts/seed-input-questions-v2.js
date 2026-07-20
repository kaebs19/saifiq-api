/**
 * Text-input (quick_input) question bank — ~110 Arabic questions across the 12
 * categories that allow quick_input (math allows only mcq/numeric).
 *
 *   node scripts/seed-input-questions-v2.js
 *
 * Answers are kept short and unambiguous on purpose: the engine compares with a
 * plain trim + toLowerCase, so spelling variants (أ/ا, ة/ه, ى/ي) would fail.
 * Idempotent: skips any question whose exact text already exists.
 */
require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Question } = require('../src/models');

const QUESTIONS = [
  // ── دين ──
  { text: 'ما اسم أول سورة في المصحف الشريف؟', answer: 'الفاتحة', category: 'din', difficulty: 'easy' },
  { text: 'في أي شهر هجري يصوم المسلمون؟', answer: 'رمضان', category: 'din', difficulty: 'easy' },
  { text: 'ما اسم الكتاب المنزّل على النبي محمد ﷺ؟', answer: 'القرآن', category: 'din', difficulty: 'easy' },
  { text: 'في أي مدينة تقع الكعبة المشرفة؟', answer: 'مكة', category: 'din', difficulty: 'easy' },
  { text: 'في أي مدينة يقع المسجد النبوي؟', answer: 'المدينة', category: 'din', difficulty: 'easy' },
  { text: 'ما اسم أطول سورة في القرآن الكريم؟', answer: 'البقرة', category: 'din', difficulty: 'medium' },
  { text: 'ما اسم أقصر سورة في القرآن الكريم؟', answer: 'الكوثر', category: 'din', difficulty: 'hard' },
  { text: 'ما اسم الملَك الموكّل بالوحي؟', answer: 'جبريل', category: 'din', difficulty: 'medium' },
  { text: 'ما لقب أبي بكر رضي الله عنه؟', answer: 'الصديق', category: 'din', difficulty: 'medium' },

  // ── تاريخ ──
  { text: 'في أي مدينة سقطت الخلافة العباسية عام 1258م؟', answer: 'بغداد', category: 'tarikh', difficulty: 'hard' },
  { text: 'ما اسم أول رئيس للولايات المتحدة الأمريكية؟', answer: 'واشنطن', category: 'tarikh', difficulty: 'medium' },
  { text: 'ما اسم القائد الذي هزم المغول في معركة عين جالوت؟', answer: 'قطز', category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي معركة حرّر صلاح الدين الأيوبي بيت المقدس؟', answer: 'حطين', category: 'tarikh', difficulty: 'hard' },
  { text: 'ما اسم السفينة الشهيرة التي غرقت عام 1912؟', answer: 'تايتانيك', category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي دولة تقع مدينة بابل الأثرية؟', answer: 'العراق', category: 'tarikh', difficulty: 'medium' },
  { text: 'ما اسم المدينة التي سُمّي باسمها الجدار الذي سقط عام 1989؟', answer: 'برلين', category: 'tarikh', difficulty: 'medium' },
  { text: 'ما اسم أول خليفة في الدولة الأموية؟', answer: 'معاوية', category: 'tarikh', difficulty: 'hard' },
  { text: 'ما اسم الحضارة القديمة التي بنت الأهرامات في مصر؟', answer: 'الفراعنة', category: 'tarikh', difficulty: 'easy' },

  // ── جغرافيا ──
  { text: 'ما هي عاصمة اليابان؟', answer: 'طوكيو', category: 'geography', difficulty: 'easy' },
  { text: 'ما هي عاصمة فرنسا؟', answer: 'باريس', category: 'geography', difficulty: 'easy' },
  { text: 'ما هي عاصمة إيطاليا؟', answer: 'روما', category: 'geography', difficulty: 'easy' },
  { text: 'ما هي عاصمة الأردن؟', answer: 'عمان', category: 'geography', difficulty: 'easy' },
  { text: 'ما هي عاصمة قطر؟', answer: 'الدوحة', category: 'geography', difficulty: 'easy' },
  { text: 'ما هي عاصمة المغرب؟', answer: 'الرباط', category: 'geography', difficulty: 'medium' },
  { text: 'ما أكبر دولة في العالم من حيث المساحة؟', answer: 'روسيا', category: 'geography', difficulty: 'medium' },
  { text: 'في أي دولة يقع برج إيفل؟', answer: 'فرنسا', category: 'geography', difficulty: 'easy' },
  { text: 'ما اسم أعلى قمة جبلية في العالم؟', answer: 'إيفرست', category: 'geography', difficulty: 'medium' },
  { text: 'ما هي عاصمة الكويت؟', answer: 'الكويت', category: 'geography', difficulty: 'easy' },

  // ── علوم ──
  { text: 'ما الرمز الكيميائي للذهب؟', answer: 'Au', category: 'science', difficulty: 'medium' },
  { text: 'ما الصيغة الكيميائية للماء؟', answer: 'H2O', category: 'science', difficulty: 'easy' },
  { text: 'ما أقرب كوكب إلى الشمس؟', answer: 'عطارد', category: 'science', difficulty: 'medium' },
  { text: 'ما أكبر كوكب في المجموعة الشمسية؟', answer: 'المشتري', category: 'science', difficulty: 'easy' },
  { text: 'ما الغاز الذي يحتاجه الإنسان للتنفس؟', answer: 'الأكسجين', category: 'science', difficulty: 'easy' },
  { text: 'ما اسم أقرب نجم إلى كوكب الأرض؟', answer: 'الشمس', category: 'science', difficulty: 'easy' },
  { text: 'ما العنصر الأكثر وفرة في الغلاف الجوي للأرض؟', answer: 'النيتروجين', category: 'science', difficulty: 'hard' },
  { text: 'ما اسم الكوكب الملقّب بالكوكب الأحمر؟', answer: 'المريخ', category: 'science', difficulty: 'easy' },
  { text: 'ما اسم العالِم صاحب نظرية النسبية؟', answer: 'أينشتاين', category: 'science', difficulty: 'medium' },
  { text: 'ما اسم الجهاز المستخدم لقياس درجة الحرارة؟', answer: 'الترمومتر', category: 'science', difficulty: 'medium' },

  // ── رياضة ──
  { text: 'في أي دولة أُقيمت بطولة كأس العالم 2022؟', answer: 'قطر', category: 'sport', difficulty: 'easy' },
  { text: 'أي منتخب فاز بكأس العالم 2022؟', answer: 'الأرجنتين', category: 'sport', difficulty: 'medium' },
  { text: 'ما اسم اللاعب الأرجنتيني صاحب القميص رقم 10 الشهير؟', answer: 'ميسي', category: 'sport', difficulty: 'easy' },
  { text: 'ما اسم النادي الإسباني الملقّب بـ"البارسا"؟', answer: 'برشلونة', category: 'sport', difficulty: 'easy' },
  { text: 'كم عدد لاعبي فريق كرة السلة داخل الملعب؟', answer: '5', category: 'sport', difficulty: 'medium' },
  { text: 'في أي رياضة يُستخدم مصطلح "نوك أوت"؟', answer: 'الملاكمة', category: 'sport', difficulty: 'medium' },
  { text: 'ما اسم الرياضة التي تُلعب بمضرب وكرة صفراء وشبكة؟', answer: 'التنس', category: 'sport', difficulty: 'easy' },
  { text: 'ما اسم اللاعب البرتغالي الشهير صاحب القميص رقم 7؟', answer: 'رونالدو', category: 'sport', difficulty: 'easy' },
  { text: 'في أي مدينة أُقيمت دورة الألعاب الأولمبية 2020؟', answer: 'طوكيو', category: 'sport', difficulty: 'hard' },

  // ── فن ──
  { text: 'من رسم لوحة الموناليزا؟', answer: 'دافنشي', category: 'art', difficulty: 'medium' },
  { text: 'ما الآلة الموسيقية التي تحتوي على 88 مفتاحاً؟', answer: 'البيانو', category: 'art', difficulty: 'easy' },
  { text: 'ما اسم فن طي الورق الياباني؟', answer: 'الأوريغامي', category: 'art', difficulty: 'medium' },
  { text: 'من مؤلف مسرحية روميو وجولييت؟', answer: 'شكسبير', category: 'art', difficulty: 'medium' },
  { text: 'ما اسم التمثال الرخامي الشهير الذي نحته مايكل أنجلو؟', answer: 'داوود', category: 'art', difficulty: 'hard' },
  { text: 'ما اسم الآلة الوترية التي تُعزف بقوس وتوضع على الكتف؟', answer: 'الكمان', category: 'art', difficulty: 'medium' },
  { text: 'ما اسم فن الرسم على الجدران في الشوارع؟', answer: 'الجرافيتي', category: 'art', difficulty: 'medium' },
  { text: 'ما اسم الآلة الموسيقية النفخية المصنوعة من القصب؟', answer: 'الناي', category: 'art', difficulty: 'medium' },

  // ── تقنية ──
  { text: 'ما اسم الشركة التي تصنع هاتف الآيفون؟', answer: 'آبل', category: 'tech', difficulty: 'easy' },
  { text: 'ما اسم نظام التشغيل الذي تطوّره جوجل للهواتف؟', answer: 'أندرويد', category: 'tech', difficulty: 'easy' },
  { text: 'ما اسم أشهر محرك بحث في العالم؟', answer: 'جوجل', category: 'tech', difficulty: 'easy' },
  { text: 'ما اسم الشركة التي طوّرت نظام ويندوز؟', answer: 'مايكروسوفت', category: 'tech', difficulty: 'easy' },
  { text: 'ما اسم أكبر موقع لمشاركة مقاطع الفيديو؟', answer: 'يوتيوب', category: 'tech', difficulty: 'easy' },
  { text: 'ما اسم أشهر عملة رقمية في العالم؟', answer: 'بيتكوين', category: 'tech', difficulty: 'medium' },
  { text: 'ما اسم الشبكة العالمية التي تربط الحواسيب حول العالم؟', answer: 'الإنترنت', category: 'tech', difficulty: 'easy' },
  { text: 'ما اسم تطبيق المراسلة الشهير الذي تملكه شركة ميتا؟', answer: 'واتساب', category: 'tech', difficulty: 'easy' },
  { text: 'ماذا يُسمى الجزء الذي يُعد "عقل" الحاسوب (CPU) بالعربية؟', answer: 'المعالج', category: 'tech', difficulty: 'medium' },

  // ── لغة ──
  { text: 'ما جمع كلمة "قلم"؟', answer: 'أقلام', category: 'language', difficulty: 'easy' },
  { text: 'ما ضد كلمة "ليل"؟', answer: 'نهار', category: 'language', difficulty: 'easy' },
  { text: 'ما مرادف كلمة "أسد"؟', answer: 'ليث', category: 'language', difficulty: 'medium' },
  { text: 'ما ضد كلمة "كبير"؟', answer: 'صغير', category: 'language', difficulty: 'easy' },
  { text: 'ما جمع كلمة "بيت"؟', answer: 'بيوت', category: 'language', difficulty: 'easy' },
  { text: 'ما ضد كلمة "قريب"؟', answer: 'بعيد', category: 'language', difficulty: 'easy' },
  { text: 'ما جمع كلمة "طالب"؟', answer: 'طلاب', category: 'language', difficulty: 'easy' },
  { text: 'ما ضد كلمة "غني"؟', answer: 'فقير', category: 'language', difficulty: 'easy' },
  { text: 'ما ضد كلمة "سهل"؟', answer: 'صعب', category: 'language', difficulty: 'easy' },

  // ── ثقافة عامة ──
  { text: 'ما أسرع حيوان بري في العالم؟', answer: 'الفهد', category: 'general', difficulty: 'medium' },
  { text: 'ما اسم الحيوان الملقّب بسفينة الصحراء؟', answer: 'الجمل', category: 'general', difficulty: 'easy' },
  { text: 'ما اسم أكبر طائر في العالم؟', answer: 'النعامة', category: 'general', difficulty: 'medium' },
  { text: 'ما اسم الحيوان الملقّب بملك الغابة؟', answer: 'الأسد', category: 'general', difficulty: 'easy' },
  { text: 'ما اسم المعدن الذي يكون سائلاً في درجة حرارة الغرفة؟', answer: 'الزئبق', category: 'general', difficulty: 'hard' },
  { text: 'ما اسم الحيوان صاحب أطول رقبة؟', answer: 'الزرافة', category: 'general', difficulty: 'easy' },
  { text: 'كم عدد قارات العالم؟', answer: '7', category: 'general', difficulty: 'easy' },
  { text: 'ما اسم الطائر الذي يُضرب به المثل في الحكمة ويطير ليلاً؟', answer: 'البومة', category: 'general', difficulty: 'medium' },
  { text: 'ما اسم الحشرة التي تنتج العسل؟', answer: 'النحلة', category: 'general', difficulty: 'easy' },

  // ── سينما وأفلام ──
  { text: 'ما اسم الأسد الصغير بطل فيلم "الأسد الملك"؟', answer: 'سيمبا', category: 'cinema', difficulty: 'easy' },
  { text: 'ما اسم السمكة المفقودة في فيلم بيكسار الشهير؟', answer: 'نيمو', category: 'cinema', difficulty: 'easy' },
  { text: 'ما اسم الشركة المنتجة لسلسلة أفلام "حكاية لعبة"؟', answer: 'بيكسار', category: 'cinema', difficulty: 'medium' },
  { text: 'ما اسم الفيلم الذي تدور أحداثه حول سفينة غرقت عام 1912؟', answer: 'تايتانيك', category: 'cinema', difficulty: 'easy' },
  { text: 'ما اسم الأميرة صاحبة الحذاء الزجاجي في أفلام ديزني؟', answer: 'سندريلا', category: 'cinema', difficulty: 'easy' },
  { text: 'ما اسم الساحر الصغير صاحب الندبة على جبينه في سلسلة أفلام شهيرة؟', answer: 'هاري بوتر', category: 'cinema', difficulty: 'easy' },
  { text: 'ما اسم القرصان بطل سلسلة "قراصنة الكاريبي"؟', answer: 'جاك سبارو', category: 'cinema', difficulty: 'hard' },
  { text: 'ما اسم الدمية الخشبية التي يطول أنفها عند الكذب؟', answer: 'بينوكيو', category: 'cinema', difficulty: 'medium' },
  { text: 'ما اسم الفيل الصغير ذو الأذنين الكبيرتين في أفلام ديزني؟', answer: 'دامبو', category: 'cinema', difficulty: 'hard' },

  // ── مشاهير ──
  { text: 'ما اسم العالِم الذي اكتشف قانون الجاذبية؟', answer: 'نيوتن', category: 'celebrities', difficulty: 'medium' },
  { text: 'ما اسم المخترع الذي طوّر المصباح الكهربائي؟', answer: 'إديسون', category: 'celebrities', difficulty: 'medium' },
  { text: 'ما اسم المستكشف الذي وصل إلى أمريكا عام 1492م؟', answer: 'كولومبوس', category: 'celebrities', difficulty: 'hard' },
  { text: 'من مؤلف مسرحيتي "هاملت" و"ماكبث"؟', answer: 'شكسبير', category: 'celebrities', difficulty: 'medium' },
  { text: 'ما اسم اللاعب البرتغالي الشهير الملقّب بـ"الدون"؟', answer: 'رونالدو', category: 'celebrities', difficulty: 'easy' },
  { text: 'ما اسم مؤسس شركتي تسلا وسبيس إكس؟', answer: 'إيلون ماسك', category: 'celebrities', difficulty: 'medium' },
  { text: 'من هو الملقّب بـ"ملك البوب"؟', answer: 'مايكل جاكسون', category: 'celebrities', difficulty: 'medium' },
  { text: 'ما اسم العالِم صاحب المعادلة الشهيرة E=mc²؟', answer: 'أينشتاين', category: 'celebrities', difficulty: 'medium' },
  { text: 'ما اسم الرحّالة المسلم الشهير الذي جاب العالم في القرن الرابع عشر؟', answer: 'ابن بطوطة', category: 'celebrities', difficulty: 'hard' },

  // ── طب وصحة ──
  { text: 'ما اسم العضو المسؤول عن ضخّ الدم في الجسم؟', answer: 'القلب', category: 'health', difficulty: 'easy' },
  { text: 'ما اسم العضو المسؤول عن تنقية الدم من الفضلات؟', answer: 'الكلية', category: 'health', difficulty: 'medium' },
  { text: 'ما المعدن الأساسي المهم لصحة العظام والأسنان؟', answer: 'الكالسيوم', category: 'health', difficulty: 'easy' },
  { text: 'ما اسم العضو الذي يُهضم فيه الطعام بعد المريء؟', answer: 'المعدة', category: 'health', difficulty: 'easy' },
  { text: 'ما اسم أكبر عضو في جسم الإنسان؟', answer: 'الجلد', category: 'health', difficulty: 'medium' },
  { text: 'ما اسم العضو الذي يتحكم بالجسم ويقوم بالتفكير؟', answer: 'الدماغ', category: 'health', difficulty: 'easy' },
  { text: 'ما اسم المرض الناتج عن اضطراب في هرمون الأنسولين؟', answer: 'السكري', category: 'health', difficulty: 'medium' },
  { text: 'ما اسم العظم الذي يحمي الدماغ؟', answer: 'الجمجمة', category: 'health', difficulty: 'easy' },
  { text: 'ما المعدن الذي يؤدي نقصه إلى فقر الدم؟', answer: 'الحديد', category: 'health', difficulty: 'medium' },
  { text: 'ما اسم العضو المسؤول عن الرؤية؟', answer: 'العين', category: 'health', difficulty: 'easy' },
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
        type: 'quick_input',
        correctAnswer: q.answer,
        category: q.category,
        difficulty: q.difficulty,
        points: pointsFor(q.difficulty),
        timeLimitSeconds: 20,
        source: 'admin',
        isActive: true,
      });
      created++;
    }

    console.log(`✅ تم: ${created} سؤال إدخال نصي جديد، ${skipped} متخطى`);
    console.log(`📊 المجموع الآن: ${await Question.count()} سؤال`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
};

seed();
