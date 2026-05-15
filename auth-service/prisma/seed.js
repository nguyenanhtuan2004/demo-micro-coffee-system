const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('123456', 10);
  const baristaPass = await bcrypt.hash('barista123', 10);

  // Admin: toàn quyền
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPass,
      name: 'Admin',
      role: 'admin',
    },
  });

  // Barista: chỉ tạo order và xem kho
  await prisma.user.upsert({
    where: { email: 'barista@example.com' },
    update: {},
    create: {
      email: 'barista@example.com',
      password: baristaPass,
      name: 'Barista',
      role: 'barista',
    },
  });

  console.log('✅ Seed completed');
  console.log('   admin@example.com   / 123456');
  console.log('   barista@example.com / barista123');
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
