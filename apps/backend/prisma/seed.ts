import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function cleanUp() {
  console.log('Cleaning up database...');
  // Delete in reverse order of dependencies to avoid foreign key constraints
  // Note: This list might need to be expanded as more tables are added
  await prisma.parentStudentMapping.deleteMany({});
  await prisma.guardian.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.staffProfile.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.platformAdmin.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenantSubscription.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.tenant.deleteMany({});
  console.log('Database cleanup completed.');
}

async function main() {
  // 1. Clean up existing data to prevent duplicate key errors during development
  await cleanUp();

  console.log('Seeding database...');

  // 2.B.09 Seed Plans
  const plans = [
    { name: 'Silver', priceMonthly: 2000, featuresConfig: { students: 100, storage: '5GB' } },
    { name: 'Gold', priceMonthly: 5000, featuresConfig: { students: 500, storage: '20GB' } },
    { name: 'Platinum', priceMonthly: 10000, featuresConfig: { students: 'Unlimited', storage: '100GB' } },
  ];

  for (const plan of plans) {
    await prisma.plan.create({
      data: {
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        featuresConfig: plan.featuresConfig,
      },
    });
  }
  console.log('Plans seeded.');

  // Password hashing
  const saltRounds = 10;
  const password = await bcrypt.hash('SuperSecretPassword123!', saltRounds);

  // 2.C.10 Create Super Admin User
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@edplatform.com',
      passwordHash: password,
      phone: '+8801700000000',
    },
  });

  console.log({ superAdmin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
