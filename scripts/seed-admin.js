require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/config/db');
const { User } = require('../src/models');

const seedAdmin = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ where: { email: 'admin@saifiq.com' } });
    if (existing) {
      console.log('\u2705 \u0627\u0644\u0623\u062F\u0645\u0646 \u0645\u0648\u062C\u0648\u062F \u0645\u0633\u0628\u0642\u0627\u064B:', existing.email);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('Admin@123', 12);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@saifiq.com',
      passwordHash,
      role: 'admin',
    });

    console.log('\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0623\u062F\u0645\u0646 \u0628\u0646\u062C\u0627\u062D');
    console.log('   \u0627\u0644\u0628\u0631\u064A\u062F: admin@saifiq.com');
    console.log('   \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631: Admin@123');
    console.log('   ID:', admin.id);
    process.exit(0);
  } catch (error) {
    console.error('\u274C \u062E\u0637\u0623:', error.message);
    process.exit(1);
  }
};

seedAdmin();
