import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('Seed');

async function main() {
  logger.log('Seeding database...');

  // 2.B.09 Seed Plans
  const plans = [
    { name: 'Silver', priceMonthly: 2000, featuresConfig: { students: 100, storage: '5GB' } },
    { name: 'Gold', priceMonthly: 5000, featuresConfig: { students: 500, storage: '20GB' } },
    { name: 'Platinum', priceMonthly: 10000, featuresConfig: { students: 'Unlimited', storage: '100GB' } },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        featuresConfig: plan.featuresConfig,
      },
    });
  }
  logger.log('Plans seeded.');

  // ১. পাসওয়ার্ড হ্যাশ করা (নিরাপত্তার জন্য)
  const saltRounds = 10;
  const password = await bcrypt.hash('SuperSecretPassword123!', saltRounds);

  // 2.C.10 Create Super Admin User
  const superAdminEmail = 'admin@edplatform.com';
  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      passwordHash: password,
      phone: '+8801700000000',
    },
  });

  // Ensure PlatformAdmin role
  // Need to find if platform admin exists
  const existingAdmin = await prisma.platformAdmin.findUnique({
    where: { userId: superAdminUser.id },
  });

  if (!existingAdmin) {
      await prisma.platformAdmin.create({
          data: {
              userId: superAdminUser.id,
              role: 'OWNER',
              accessLevel: 'FULL',
          }
      });
      logger.log('Platform Admin created.');
  } else {
      logger.log('Platform Admin already exists.');
  }

  logger.log({ superAdminUser });
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
