require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Item } = require('../src/models');
const { ITEM_TYPES, GOLD_COSTS } = require('../src/config/constants');

const ITEM_DETAILS = {
  eliminate_two: { nameAr: '\u062D\u0630\u0641 \u0625\u062C\u0627\u0628\u062A\u064A\u0646', descriptionAr: '\u064A\u062D\u0630\u0641 \u062E\u064A\u0627\u0631\u064A\u0646 \u062E\u0627\u0637\u0626\u064A\u0646 \u0645\u0646 \u0633\u0624\u0627\u0644 MCQ' },
  hint: { nameAr: '\u062A\u0644\u0645\u064A\u062D', descriptionAr: '\u064A\u0639\u0631\u0636 \u062A\u0644\u0645\u064A\u062D\u0627\u064B \u0644\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629' },
  freeze_time: { nameAr: '\u062A\u062C\u0645\u064A\u062F \u0627\u0644\u0648\u0642\u062A', descriptionAr: '\u064A\u0648\u0642\u0641 \u0627\u0644\u0645\u0624\u0642\u062A \u0645\u0624\u0642\u062A\u0627\u064B' },
  shield: { nameAr: '\u062F\u0631\u0639 \u062D\u0645\u0627\u064A\u0629', descriptionAr: '\u064A\u062D\u0645\u064A \u0645\u0646 \u0647\u062C\u0645\u0629 \u0648\u0627\u062D\u062F\u0629' },
  double_damage: { nameAr: '\u0636\u0639\u0641 \u0627\u0644\u0636\u0631\u0631', descriptionAr: '\u064A\u0636\u0627\u0639\u0641 \u0627\u0644\u0636\u0631\u0631 \u0641\u064A \u0627\u0644\u0647\u062C\u0648\u0645' },
  steal: { nameAr: '\u0633\u0631\u0642\u0629', descriptionAr: '\u064A\u0633\u0631\u0642 \u062C\u0648\u0627\u0647\u0631 \u0645\u0646 \u062E\u0635\u0645' },
  skip: { nameAr: '\u062A\u062E\u0637\u0649 \u0627\u0644\u0633\u0624\u0627\u0644', descriptionAr: '\u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u062D\u0627\u0644\u064A' },
  reveal: { nameAr: '\u0643\u0634\u0641 \u0627\u0644\u0625\u062C\u0627\u0628\u0629', descriptionAr: '\u064A\u0643\u0634\u0641 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629' },
  narrow_range: { nameAr: 'تضييق النطاق', descriptionAr: 'يعرض نطاقاً ضيقاً للإجابة الرقمية الصحيحة' },
};

const seed = async () => {
  try {
    await connectDB();
    let created = 0;
    let skipped = 0;

    for (const [key, type] of Object.entries(ITEM_TYPES)) {
      const existing = await Item.findOne({ where: { type } });
      if (existing) { skipped++; continue; }
      const details = ITEM_DETAILS[type];
      await Item.create({
        type,
        nameAr: details.nameAr,
        descriptionAr: details.descriptionAr,
        goldCost: GOLD_COSTS[type],
        isActive: true,
      });
      created++;
    }

    console.log(`\u2705 Items seeded: ${created} new, ${skipped} existing`);
    process.exit(0);
  } catch (e) {
    console.error('\u274C', e.message);
    process.exit(1);
  }
};

seed();
