/**
 * تطبيع النص العربي لمقارنة إجابات الأسئلة النصية (quick_input).
 *
 * لوحات المفاتيح العربية غالباً لا تُدخل الهمزات أو التشكيل، فالمقارنة
 * الحرفية كانت ترفض إجابات صحيحة ("الاسد" مقابل "الأسد").
 *
 * ما يفعله (تطبيع متوازن — لا يحذف "ال" التعريف):
 *  - إزالة التشكيل والتطويل
 *  - توحيد صور الألف: أ إ آ ٱ → ا
 *  - توحيد ة → ه ، ى → ي ، ؤ → و ، ئ → ي
 *  - توحيد الأرقام العربية-الهندية (٠-٩) إلى 0-9
 *  - تصغير الحروف اللاتينية (لإجابات مثل Au / H2O)
 *  - دمج المسافات المتكررة وإزالة الأطراف
 */

// التشكيل: الفتحة..السكون + الألف الخنجرية، والتطويل
const DIACRITICS = /[ً-ْٰ]/g;
const TATWEEL = /ـ/g;
const ARABIC_INDIC_DIGITS = /[٠-٩]/g;

const normalizeAnswer = (value) => {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace(DIACRITICS, '')
    .replace(TATWEEL, '')
    .replace(ARABIC_INDIC_DIGITS, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

/// هل الإجابتان متطابقتان بعد التطبيع؟
const answersMatch = (a, b) => {
  const na = normalizeAnswer(a);
  return na.length > 0 && na === normalizeAnswer(b);
};

module.exports = { normalizeAnswer, answersMatch };
