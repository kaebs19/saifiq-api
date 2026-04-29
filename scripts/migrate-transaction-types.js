/**
 * Adds new ENUM values to Transactions.type:
 *   - match_wager
 *   - ad_reward
 *
 * Postgres requires ALTER TYPE ADD VALUE outside a transaction.
 *
 * Run on the server:
 *   node scripts/migrate-transaction-types.js
 */

require('dotenv').config();
const { sequelize } = require('../src/config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🔌 Connected to DB');

    const newValues = ['match_wager', 'ad_reward'];

    for (const value of newValues) {
      try {
        await sequelize.query(
          `ALTER TYPE "enum_Transactions_type" ADD VALUE IF NOT EXISTS '${value}';`
        );
        console.log(`✅ Added ENUM value: ${value}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`ℹ️  Already exists: ${value}`);
        } else {
          throw err;
        }
      }
    }

    console.log('🎉 Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
})();
