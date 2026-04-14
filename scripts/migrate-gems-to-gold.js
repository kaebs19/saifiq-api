/**
 * One-time migration: Convert gems → gold (dual currency system)
 *
 * What this script does:
 * 1. Renames Items.gemCost column → goldCost
 * 2. Adds gold column to Users (copies existing gems value)
 * 3. Resets gems to 0 (gems = premium currency now)
 * 4. Adds currency column to Transactions (defaults to 'gold')
 * 5. Marks avatar purchase transactions as currency = 'gems'
 *
 * Run: node scripts/migrate-gems-to-gold.js
 */
require('dotenv').config();
const { sequelize } = require('../src/config/db');

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // 1. Rename gemCost → goldCost in Items table
    const [itemCols] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Items' AND column_name = 'gemCost'
    `);
    if (itemCols.length > 0) {
      await sequelize.query('ALTER TABLE "Items" RENAME COLUMN "gemCost" TO "goldCost"');
      console.log('✅ Items: gemCost → goldCost');
    } else {
      console.log('⏭️  Items: goldCost already exists');
    }

    // 2. Add gold column to Users if not exists
    const [userCols] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Users' AND column_name = 'gold'
    `);
    if (userCols.length === 0) {
      await sequelize.query('ALTER TABLE "Users" ADD COLUMN "gold" INTEGER DEFAULT 500');
      // Copy existing gems to gold
      await sequelize.query('UPDATE "Users" SET "gold" = "gems"');
      console.log('✅ Users: gold column added, gems copied to gold');
    } else {
      console.log('⏭️  Users: gold column already exists');
    }

    // 3. Reset gems to 0 (premium currency)
    const [result] = await sequelize.query('UPDATE "Users" SET "gems" = 0 RETURNING COUNT(*)');
    console.log('✅ Users: gems reset to 0 (premium currency)');

    // 4. Add currency column to Transactions if not exists
    const [txCols] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Transactions' AND column_name = 'currency'
    `);
    if (txCols.length === 0) {
      await sequelize.query(`
        CREATE TYPE "enum_Transactions_currency" AS ENUM ('gold', 'gems');
        ALTER TABLE "Transactions" ADD COLUMN "currency" "enum_Transactions_currency" DEFAULT 'gold';
      `);
      console.log('✅ Transactions: currency column added');
    } else {
      console.log('⏭️  Transactions: currency column already exists');
    }

    // 5. Mark avatar purchases as gems currency
    await sequelize.query(`
      UPDATE "Transactions" SET "currency" = 'gems'
      WHERE "type" = 'purchase' AND "description" LIKE '%صورة شخصية%'
    `);
    console.log('✅ Transactions: avatar purchases marked as gems');

    console.log('\n🎉 Migration complete!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  }
};

migrate();
