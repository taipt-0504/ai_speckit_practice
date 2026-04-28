import prisma from '../lib/db/prisma';
import bcrypt from 'bcryptjs';

const DEFAULT_CATEGORIES = [
  { name: 'Ăn uống', isDefault: true },
  { name: 'Di chuyển', isDefault: true },
  { name: 'Nhà ở', isDefault: true },
  { name: 'Giải trí', isDefault: true },
  { name: 'Sức khỏe', isDefault: true },
  { name: 'Mua sắm', isDefault: true },
  { name: 'Thu nhập', isDefault: true },
  { name: 'Khác', isDefault: true },
];

async function main() {
  console.log('⏳ Seeding database...');

  try {
    // Create or update admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        status: 'active',
      },
    });

    console.log('✓ Admin user created/updated:', admin.email);

    // Create default categories
    for (const category of DEFAULT_CATEGORIES) {
      const existingCategory = await prisma.category.findFirst({
        where: { name: category.name, ownerId: null },
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: {
            name: category.name,
            isDefault: true,
            ownerId: null,
          },
        });
        console.log('✓ Category created:', category.name);
      }
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
