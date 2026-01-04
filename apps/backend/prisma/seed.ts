import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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
  console.log('Plans seeded.');

  // ১. পাসওয়ার্ড হ্যাশ করা (নিরাপত্তার জন্য)
  const saltRounds = 10;
  const password = await bcrypt.hash('SuperSecretPassword123!', saltRounds);

  // 2.C.10 Create Super Admin User and EduMatrix Tenant

  // Create EduMatrix Tenant
  const eduMatrixTenant = await prisma.tenant.upsert({
    where: { subdomain: 'edumatrix' },
    update: {},
    create: {
      name: 'EduMatrix HQ',
      subdomain: 'edumatrix',
      subscriptionStatus: 'ACTIVE',
    },
  });

  // Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@edplatform.com' },
    update: {},
    create: {
      email: 'admin@edplatform.com',
      passwordHash: password,
      phone: '+8801700000000',
      isActive: true,
    },
  });

  // Create Profile for Super Admin
  await prisma.profile.upsert({
    where: {
      userId_tenantId: {
        userId: superAdmin.id,
        tenantId: eduMatrixTenant.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      tenantId: eduMatrixTenant.id,
      role: 'SUPER_ADMIN',
    },
  });

  console.log({ superAdmin, eduMatrixTenant });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });