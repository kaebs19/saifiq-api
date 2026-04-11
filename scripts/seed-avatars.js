require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Avatar } = require('../src/models');

const AVATARS = [
  // أول 5 مجانية
  { name: 'شخصية 1', imageUrl: '/uploads/avatars/defaults/avatar-01.png', gemCost: 0, sortOrder: 1 },
  { name: 'شخصية 2', imageUrl: '/uploads/avatars/defaults/avatar-02.png', gemCost: 0, sortOrder: 2 },
  { name: 'شخصية 3', imageUrl: '/uploads/avatars/defaults/avatar-03.png', gemCost: 0, sortOrder: 3 },
  { name: 'شخصية 4', imageUrl: '/uploads/avatars/defaults/avatar-04.png', gemCost: 0, sortOrder: 4 },
  { name: 'شخصية 5', imageUrl: '/uploads/avatars/defaults/avatar-05.png', gemCost: 0, sortOrder: 5 },
  // أسعار متدرجة
  { name: 'شخصية 6', imageUrl: '/uploads/avatars/defaults/avatar-06.png', gemCost: 30, sortOrder: 6 },
  { name: 'شخصية 7', imageUrl: '/uploads/avatars/defaults/avatar-07.png', gemCost: 30, sortOrder: 7 },
  { name: 'شخصية 8', imageUrl: '/uploads/avatars/defaults/avatar-08.png', gemCost: 50, sortOrder: 8 },
  { name: 'شخصية 9', imageUrl: '/uploads/avatars/defaults/avatar-09.png', gemCost: 50, sortOrder: 9 },
  { name: 'شخصية 10', imageUrl: '/uploads/avatars/defaults/avatar-10.png', gemCost: 60, sortOrder: 10 },
  { name: 'شخصية 11', imageUrl: '/uploads/avatars/defaults/avatar-11.png', gemCost: 70, sortOrder: 11 },
  { name: 'شخصية 12', imageUrl: '/uploads/avatars/defaults/avatar-12.png', gemCost: 80, sortOrder: 12 },
  { name: 'شخصية 13', imageUrl: '/uploads/avatars/defaults/avatar-13.png', gemCost: 90, sortOrder: 13 },
  { name: 'شخصية 14', imageUrl: '/uploads/avatars/defaults/avatar-14.png', gemCost: 100, sortOrder: 14 },
];

const seed = async () => {
  try {
    await connectDB();
    let created = 0;
    let skipped = 0;

    for (const data of AVATARS) {
      const existing = await Avatar.findOne({ where: { imageUrl: data.imageUrl } });
      if (existing) { skipped++; continue; }
      await Avatar.create({ ...data, isActive: true });
      created++;
    }

    console.log(`✅ Avatars seeded: ${created} new, ${skipped} existing`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
};

seed();
