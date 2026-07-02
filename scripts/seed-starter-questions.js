/**
 * Starter question bank — real Arabic MCQ questions across all 13 categories
 * (including the new cinema / celebrities / health). Idempotent: skips any
 * question whose exact text already exists.
 *
 *   node scripts/seed-starter-questions.js
 *
 * connectDB runs sync({ alter: true }), which also ensures the new category
 * enum values exist before inserting.
 */
require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Question } = require('../src/models');

// كل الأسئلة من نوع MCQ (مسموح في كل الفئات). correct = فهرس الخيار الصحيح.
const QUESTIONS = [
  // ── دين ──
  { text: 'كم عدد أركان الإسلام؟', options: ['4', '5', '6', '7'], correct: 1, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد أركان الإيمان؟', options: ['4', '5', '6', '7'], correct: 2, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد السور في القرآن الكريم؟', options: ['110', '112', '114', '116'], correct: 2, category: 'din', difficulty: 'easy' },
  { text: 'ما أول سورة في المصحف الشريف؟', options: ['البقرة', 'الفاتحة', 'الناس', 'الإخلاص'], correct: 1, category: 'din', difficulty: 'easy' },
  { text: 'في أي شهر يصوم المسلمون؟', options: ['شعبان', 'رمضان', 'شوال', 'محرم'], correct: 1, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد الصلوات المفروضة في اليوم والليلة؟', options: ['3', '4', '5', '6'], correct: 2, category: 'din', difficulty: 'easy' },
  { text: 'كم عدد ركعات صلاة الفجر؟', options: ['2', '3', '4', '5'], correct: 0, category: 'din', difficulty: 'easy' },
  { text: 'ما الكتاب المنزّل على النبي عيسى عليه السلام؟', options: ['التوراة', 'الإنجيل', 'الزبور', 'القرآن'], correct: 1, category: 'din', difficulty: 'medium' },
  { text: 'من هو أول الخلفاء الراشدين؟', options: ['عمر بن الخطاب', 'عثمان بن عفان', 'أبو بكر الصديق', 'علي بن أبي طالب'], correct: 2, category: 'din', difficulty: 'medium' },

  // ── تاريخ ──
  { text: 'في أي عام بدأت الحرب العالمية الثانية؟', options: ['1935', '1939', '1941', '1945'], correct: 1, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام توحدت المملكة العربية السعودية؟', options: ['1932', '1945', '1950', '1926'], correct: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'من مؤسس الدولة السعودية الأولى؟', options: ['الملك عبدالعزيز', 'الإمام محمد بن سعود', 'الإمام تركي', 'الملك فيصل'], correct: 1, category: 'tarikh', difficulty: 'hard' },
  { text: 'في أي عام انتهت الحرب العالمية الأولى؟', options: ['1916', '1918', '1920', '1922'], correct: 1, category: 'tarikh', difficulty: 'medium' },
  { text: 'من أول رئيس للولايات المتحدة الأمريكية؟', options: ['لينكولن', 'جورج واشنطن', 'جيفرسون', 'آدمز'], correct: 1, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي عام هبط الإنسان على سطح القمر؟', options: ['1965', '1969', '1972', '1959'], correct: 1, category: 'tarikh', difficulty: 'medium' },
  { text: 'من القائد المسلم الذي فتح الأندلس؟', options: ['طارق بن زياد', 'صلاح الدين', 'خالد بن الوليد', 'عقبة بن نافع'], correct: 0, category: 'tarikh', difficulty: 'medium' },
  { text: 'في أي مدينة سقطت الخلافة العباسية عام 1258م؟', options: ['دمشق', 'بغداد', 'القاهرة', 'قرطبة'], correct: 1, category: 'tarikh', difficulty: 'hard' },

  // ── جغرافيا ──
  { text: 'ما هي عاصمة المملكة العربية السعودية؟', options: ['جدة', 'الرياض', 'مكة', 'الدمام'], correct: 1, category: 'geography', difficulty: 'easy' },
  { text: 'ما هي عاصمة مصر؟', options: ['الإسكندرية', 'الأقصر', 'القاهرة', 'أسوان'], correct: 2, category: 'geography', difficulty: 'easy' },
  { text: 'ما هو أكبر محيط في العالم؟', options: ['الأطلسي', 'الهندي', 'الهادئ', 'المتجمد الشمالي'], correct: 2, category: 'geography', difficulty: 'medium' },
  { text: 'ما هي عاصمة اليابان؟', options: ['بكين', 'طوكيو', 'سيول', 'بانكوك'], correct: 1, category: 'geography', difficulty: 'easy' },
  { text: 'ما هي أكبر قارة من حيث المساحة؟', options: ['أفريقيا', 'آسيا', 'أوروبا', 'أمريكا الشمالية'], correct: 1, category: 'geography', difficulty: 'easy' },
  { text: 'في أي قارة تقع مصر؟', options: ['آسيا', 'أفريقيا', 'أوروبا', 'أمريكا'], correct: 1, category: 'geography', difficulty: 'easy' },
  { text: 'ما هي أكبر دولة في العالم من حيث المساحة؟', options: ['كندا', 'الصين', 'روسيا', 'الولايات المتحدة'], correct: 2, category: 'geography', difficulty: 'medium' },
  { text: 'ما هي أصغر قارة في العالم؟', options: ['أوروبا', 'أستراليا', 'أنتاركتيكا', 'أمريكا الجنوبية'], correct: 1, category: 'geography', difficulty: 'medium' },
  { text: 'ما هي عاصمة تركيا؟', options: ['إسطنبول', 'أنقرة', 'إزمير', 'بورصة'], correct: 1, category: 'geography', difficulty: 'medium' },

  // ── علوم ──
  { text: 'ما هو الرمز الكيميائي للذهب؟', options: ['Au', 'Ag', 'Gd', 'Go'], correct: 0, category: 'science', difficulty: 'medium' },
  { text: 'كم عدد كواكب المجموعة الشمسية؟', options: ['7', '8', '9', '10'], correct: 1, category: 'science', difficulty: 'easy' },
  { text: 'ما هو أكبر كوكب في المجموعة الشمسية؟', options: ['زحل', 'المريخ', 'المشتري', 'الأرض'], correct: 2, category: 'science', difficulty: 'easy' },
  { text: 'ما هي الوحدة الأساسية للحياة؟', options: ['الذرة', 'الخلية', 'الجزيء', 'النواة'], correct: 1, category: 'science', difficulty: 'medium' },
  { text: 'ما هو الغاز الذي يتنفسه الإنسان للبقاء حياً؟', options: ['النيتروجين', 'الأكسجين', 'الهيدروجين', 'ثاني أكسيد الكربون'], correct: 1, category: 'science', difficulty: 'easy' },
  { text: 'كم عدد عظام جسم الإنسان البالغ؟', options: ['206', '201', '210', '196'], correct: 0, category: 'science', difficulty: 'medium' },
  { text: 'ما هو أقرب كوكب إلى الشمس؟', options: ['الزهرة', 'عطارد', 'الأرض', 'المريخ'], correct: 1, category: 'science', difficulty: 'medium' },
  { text: 'ما هو العنصر الأكثر وفرة في الغلاف الجوي للأرض؟', options: ['الأكسجين', 'النيتروجين', 'الكربون', 'الهيدروجين'], correct: 1, category: 'science', difficulty: 'medium' },
  { text: 'كم تبلغ سرعة الضوء تقريباً (كم/ثانية)؟', options: ['300000', '150000', '30000', '1000000'], correct: 0, category: 'science', difficulty: 'hard' },

  // ── رياضة ──
  { text: 'كم عدد لاعبي فريق كرة القدم في الملعب؟', options: ['9', '10', '11', '12'], correct: 2, category: 'sport', difficulty: 'easy' },
  { text: 'أين أُقيمت بطولة كأس العالم 2022؟', options: ['روسيا', 'قطر', 'البرازيل', 'ألمانيا'], correct: 1, category: 'sport', difficulty: 'easy' },
  { text: 'كل كم سنة تُقام بطولة كأس العالم لكرة القدم؟', options: ['2', '3', '4', '5'], correct: 2, category: 'sport', difficulty: 'easy' },
  { text: 'كم عدد لاعبي فريق كرة السلة في الملعب؟', options: ['5', '6', '7', '11'], correct: 0, category: 'sport', difficulty: 'medium' },
  { text: 'أي منتخب فاز بكأس العالم 2022؟', options: ['فرنسا', 'الأرجنتين', 'البرازيل', 'ألمانيا'], correct: 1, category: 'sport', difficulty: 'medium' },
  { text: 'كم شوطاً في مباراة كرة القدم؟', options: ['1', '2', '3', '4'], correct: 1, category: 'sport', difficulty: 'easy' },
  { text: 'أي نادٍ إسباني يُلقّب بـ"النادي الملكي"؟', options: ['برشلونة', 'ريال مدريد', 'أتلتيكو مدريد', 'إشبيلية'], correct: 1, category: 'sport', difficulty: 'medium' },
  { text: 'في أي رياضة يوجد مصطلح "سلام دنك"؟', options: ['كرة القدم', 'كرة السلة', 'التنس', 'السباحة'], correct: 1, category: 'sport', difficulty: 'easy' },

  // ── فن ──
  { text: 'من رسم لوحة الموناليزا؟', options: ['بيكاسو', 'ليوناردو دافنشي', 'فان جوخ', 'رامبرانت'], correct: 1, category: 'art', difficulty: 'medium' },
  { text: 'من مؤلف مسرحية روميو وجولييت؟', options: ['ديكنز', 'شكسبير', 'همنغواي', 'تولستوي'], correct: 1, category: 'art', difficulty: 'medium' },
  { text: 'من رسم لوحة "الليلة المرصعة بالنجوم"؟', options: ['فان جوخ', 'مونيه', 'مانيه', 'دالي'], correct: 0, category: 'art', difficulty: 'hard' },
  { text: 'ما الآلة الموسيقية التي تحتوي على 88 مفتاحاً؟', options: ['الجيتار', 'البيانو', 'الكمان', 'الناي'], correct: 1, category: 'art', difficulty: 'easy' },
  { text: 'من نحت تمثال "داوود" الشهير؟', options: ['مايكل أنجلو', 'دافنشي', 'رافائيل', 'دوناتيلو'], correct: 0, category: 'art', difficulty: 'hard' },
  { text: 'ما اسم فن طي الورق الياباني؟', options: ['الأوريغامي', 'الإيكيبانا', 'الكاليغرافي', 'المانغا'], correct: 0, category: 'art', difficulty: 'medium' },

  // ── تقنية ──
  { text: 'ماذا يعني اختصار HTML؟', options: ['Hyperlinks and Text Markup', 'Hyper Text Markup Language', 'Home Tool Markup Language', 'High Text Markup Language'], correct: 1, category: 'tech', difficulty: 'medium' },
  { text: 'من هو مؤسس شركة Apple؟', options: ['بيل غيتس', 'ستيف جوبز', 'إيلون ماسك', 'مارك زوكربرغ'], correct: 1, category: 'tech', difficulty: 'easy' },
  { text: 'ما لغة البرمجة الأساسية لتطبيقات iOS؟', options: ['Java', 'Swift', 'Python', 'C#'], correct: 1, category: 'tech', difficulty: 'medium' },
  { text: 'من هو المؤسس المشارك لشركة Microsoft؟', options: ['بيل غيتس', 'ستيف جوبز', 'لاري بيج', 'جيف بيزوس'], correct: 0, category: 'tech', difficulty: 'easy' },
  { text: 'ماذا يعني اختصار CPU؟', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Power Unit', 'Control Processing Unit'], correct: 0, category: 'tech', difficulty: 'medium' },
  { text: 'أي شركة تطوّر نظام أندرويد؟', options: ['آبل', 'جوجل', 'مايكروسوفت', 'سامسونج'], correct: 1, category: 'tech', difficulty: 'easy' },
  { text: 'ماذا يعني اختصار www؟', options: ['World Wide Web', 'Web World Wide', 'Wide World Web', 'World Web Wide'], correct: 0, category: 'tech', difficulty: 'easy' },

  // ── لغة ──
  { text: 'ما جمع كلمة "كتاب"؟', options: ['كتابان', 'كتب', 'مكاتب', 'كتّاب'], correct: 1, category: 'language', difficulty: 'easy' },
  { text: 'ما ضد كلمة "ليل"؟', options: ['مساء', 'ظلام', 'نهار', 'فجر'], correct: 2, category: 'language', difficulty: 'easy' },
  { text: 'كم عدد حروف الهجاء في اللغة العربية؟', options: ['26', '28', '30', '32'], correct: 1, category: 'language', difficulty: 'easy' },
  { text: 'ما مرادف كلمة "أسد"؟', options: ['نمر', 'ليث', 'ذئب', 'فهد'], correct: 1, category: 'language', difficulty: 'medium' },
  { text: 'ما جمع كلمة "قلم"؟', options: ['أقلام', 'قلمان', 'قلوم', 'قلمات'], correct: 0, category: 'language', difficulty: 'easy' },
  { text: 'ما نوع كلمة "يكتب"؟', options: ['اسم', 'فعل', 'حرف', 'ظرف'], correct: 1, category: 'language', difficulty: 'easy' },
  { text: 'ما ضد كلمة "كبير"؟', options: ['ضخم', 'صغير', 'واسع', 'طويل'], correct: 1, category: 'language', difficulty: 'easy' },

  // ── ثقافة عامة ──
  { text: 'كم عدد ألوان قوس قزح؟', options: ['5', '6', '7', '8'], correct: 2, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد أيام الأسبوع؟', options: ['5', '6', '7', '8'], correct: 2, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد ساعات اليوم؟', options: ['12', '18', '24', '30'], correct: 2, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد أشهر السنة الميلادية؟', options: ['10', '11', '12', '13'], correct: 2, category: 'general', difficulty: 'easy' },
  { text: 'ما هو أكبر حيوان في العالم؟', options: ['الفيل', 'الحوت الأزرق', 'الزرافة', 'القرش'], correct: 1, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد ألوان علم المملكة العربية السعودية؟', options: ['1', '2', '3', '4'], correct: 1, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد قارات العالم؟', options: ['5', '6', '7', '8'], correct: 2, category: 'general', difficulty: 'easy' },
  { text: 'كم عدد أصابع اليد الواحدة؟', options: ['4', '5', '6', '3'], correct: 1, category: 'general', difficulty: 'easy' },

  // ── رياضيات ──
  { text: 'كم يساوي 15 × 4؟', options: ['50', '60', '65', '70'], correct: 1, category: 'math', difficulty: 'easy' },
  { text: 'ما هو الجذر التربيعي للعدد 144؟', options: ['10', '11', '12', '14'], correct: 2, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 7 × 8؟', options: ['54', '56', '58', '64'], correct: 1, category: 'math', difficulty: 'easy' },
  { text: 'كم يساوي الثابت π تقريباً؟', options: ['2.71', '3.14', '3.45', '4.00'], correct: 1, category: 'math', difficulty: 'medium' },
  { text: 'كم يساوي 100 ÷ 4؟', options: ['20', '25', '30', '40'], correct: 1, category: 'math', difficulty: 'easy' },
  { text: 'ما ناتج 12 + 15؟', options: ['25', '27', '29', '30'], correct: 1, category: 'math', difficulty: 'easy' },
  { text: 'كم عدد أضلاع المثلث؟', options: ['3', '4', '5', '6'], correct: 0, category: 'math', difficulty: 'easy' },
  { text: 'ما ناتج 9 مربّع (9²)؟', options: ['72', '81', '90', '99'], correct: 1, category: 'math', difficulty: 'medium' },

  // ── سينما وأفلام ──
  { text: 'من بطل سلسلة أفلام "المهمة المستحيلة" (Mission Impossible)؟', options: ['توم كروز', 'براد بيت', 'ليوناردو دي كابريو', 'مات ديمون'], correct: 0, category: 'cinema', difficulty: 'medium' },
  { text: 'أي فيلم رسوم متحركة يشتهر بشخصية الأسد "سيمبا"؟', options: ['الأسد الملك', 'علاء الدين', 'البحث عن نيمو', 'شريك'], correct: 0, category: 'cinema', difficulty: 'easy' },
  { text: 'من أخرج فيلم "تايتانيك" (Titanic)؟', options: ['ستيفن سبيلبرغ', 'جيمس كاميرون', 'كريستوفر نولان', 'مارتن سكورسيزي'], correct: 1, category: 'cinema', difficulty: 'hard' },
  { text: 'ما اسم الساحر الصغير بطل سلسلة الأفلام الشهيرة؟', options: ['فرودو', 'هاري بوتر', 'بيرسي جاكسون', 'أراغورن'], correct: 1, category: 'cinema', difficulty: 'easy' },
  { text: 'أي شركة أنتجت سلسلة أفلام "حكاية لعبة" (Toy Story)؟', options: ['ديزني بيكسار', 'دريم ووركس', 'وارنر برذرز', 'يونيفرسال'], correct: 0, category: 'cinema', difficulty: 'medium' },
  { text: 'من مثّل شخصية "الرجل الحديدي" (Iron Man)؟', options: ['كريس إيفانز', 'روبرت داوني جونيور', 'كريس هيمسورث', 'مارك رافالو'], correct: 1, category: 'cinema', difficulty: 'medium' },
  { text: 'من بطل فيلم "فورست غامب" (Forrest Gump)؟', options: ['توم هانكس', 'توم كروز', 'كيفن كوستنر', 'دنزل واشنطن'], correct: 0, category: 'cinema', difficulty: 'medium' },

  // ── مشاهير ──
  { text: 'من مؤسس شركتي تسلا وسبيس إكس؟', options: ['جيف بيزوس', 'إيلون ماسك', 'بيل غيتس', 'مارك زوكربرغ'], correct: 1, category: 'celebrities', difficulty: 'easy' },
  { text: 'من مؤسس موقع فيسبوك؟', options: ['مارك زوكربرغ', 'جاك دورسي', 'لاري بيج', 'بيل غيتس'], correct: 0, category: 'celebrities', difficulty: 'easy' },
  { text: 'من الملقّب بـ"ملك البوب"؟', options: ['إلفيس بريسلي', 'مايكل جاكسون', 'فريدي ميركوري', 'إلتون جون'], correct: 1, category: 'celebrities', difficulty: 'medium' },
  { text: 'أي لاعب برتغالي شهير يرتدي القميص رقم 7؟', options: ['ميسي', 'كريستيانو رونالدو', 'نيمار', 'مبابي'], correct: 1, category: 'celebrities', difficulty: 'easy' },
  { text: 'من مؤلف مسرحيات "هاملت" و"ماكبث"؟', options: ['تشارلز ديكنز', 'ويليام شكسبير', 'مارك توين', 'تولستوي'], correct: 1, category: 'celebrities', difficulty: 'medium' },
  { text: 'من العالِم صاحب نظرية النسبية؟', options: ['إسحاق نيوتن', 'ألبرت أينشتاين', 'غاليليو', 'ستيفن هوكينغ'], correct: 1, category: 'celebrities', difficulty: 'medium' },
  { text: 'من المؤسس المشارك لشركة مايكروسوفت مع بول ألن؟', options: ['ستيف جوبز', 'بيل غيتس', 'إيلون ماسك', 'جيف بيزوس'], correct: 1, category: 'celebrities', difficulty: 'easy' },

  // ── طب وصحة ──
  { text: 'كم عدد رئتي الإنسان؟', options: ['1', '2', '3', '4'], correct: 1, category: 'health', difficulty: 'easy' },
  { text: 'ما العضو المسؤول عن ضخّ الدم في الجسم؟', options: ['الكبد', 'القلب', 'الرئة', 'الكلية'], correct: 1, category: 'health', difficulty: 'easy' },
  { text: 'كم عدد أسنان الإنسان البالغ؟', options: ['28', '30', '32', '34'], correct: 2, category: 'health', difficulty: 'medium' },
  { text: 'أي فيتامين نحصل عليه أساساً من أشعة الشمس؟', options: ['فيتامين A', 'فيتامين C', 'فيتامين D', 'فيتامين B12'], correct: 2, category: 'health', difficulty: 'medium' },
  { text: 'ما العضو المسؤول عن تنقية الدم من الفضلات؟', options: ['القلب', 'الكلية', 'المعدة', 'الرئة'], correct: 1, category: 'health', difficulty: 'medium' },
  { text: 'كم عدد غرف القلب في الإنسان؟', options: ['2', '3', '4', '5'], correct: 2, category: 'health', difficulty: 'medium' },
  { text: 'ما المعدن الأساسي المهم لصحة العظام والأسنان؟', options: ['الحديد', 'الكالسيوم', 'البوتاسيوم', 'الزنك'], correct: 1, category: 'health', difficulty: 'easy' },
  { text: 'كم يبلغ حجم الدم في جسم الإنسان البالغ تقريباً (باللتر)؟', options: ['3', '5', '8', '10'], correct: 1, category: 'health', difficulty: 'medium' },
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

      const options = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correct }));
      await Question.create({
        text: q.text,
        type: 'mcq',
        options,
        category: q.category,
        difficulty: q.difficulty,
        points: pointsFor(q.difficulty),
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
