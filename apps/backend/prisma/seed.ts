import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 2.B.09 Seed Plans
  const plans = [
    { name: 'Silver', priceMonthly: 2000, priceYearly: 20000, featuresConfig: { students: 100, storage: '5GB' } },
    { name: 'Gold', priceMonthly: 5000, priceYearly: 50000, featuresConfig: { students: 500, storage: '20GB' } },
    { name: 'Platinum', priceMonthly: 10000, priceYearly: 100000, featuresConfig: { students: 'Unlimited', storage: '100GB' } },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        featuresConfig: plan.featuresConfig,
      },
    });
  }
  console.log('Plans seeded.');

  // Create Default Institute (Requirement 1)
  const defaultInstituteName = 'Greenwood High';
  const defaultSubdomain = 'greenwood';

  const institute = await prisma.institute.upsert({
    where: { subdomain: defaultSubdomain },
    update: {},
    create: {
        name: defaultInstituteName,
        subdomain: defaultSubdomain,
        isActive: true,
        logoUrl: 'https://example.com/logo.png',
        subscriptionStatus: 'ACTIVE'
    }
  });
  console.log({ institute });

  // Create Default Subscription for the Institute
  // We need a plan first
  const silverPlan = await prisma.plan.findUnique({ where: { name: 'Silver' } });
  if (silverPlan) {
      await prisma.instituteSubscription.upsert({
          where: { instituteId: institute.id },
          update: {},
          create: {
              instituteId: institute.id,
              planId: silverPlan.id,
              billingCycle: 'YEARLY',
              expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
              autoRenew: true
          }
      });
      console.log('Subscription seeded.');
  }


  // ১. পাসওয়ার্ড হ্যাশ করা (নিরাপত্তার জন্য)
  const saltRounds = 10;
  const password = await bcrypt.hash('SuperSecretPassword123!', saltRounds);

  // 2.C.10 Create Super Admin User
  // Note: In real scenario, Super Admin might not need a profile linked to a tenant immediately, 
  // or linked to a default "Admin Tenant". For now, creating just the User.
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@edplatform.com' },
    update: {}, // ইউজার ইতিমধ্যে থাকলে কিছু আপডেট করার দরকার নেই
    create: {
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
