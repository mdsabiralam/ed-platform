import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
// Import security seed logic if it were a function, or run it here.
// Since seed-security.ts is standalone, we will invoke its logic here or copy it.
// Copying is safer to ensure single transaction/context if needed, but separate is fine too.
// I will just add the security seeding logic here directly to avoid module resolution issues with ts-node.

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

  // Security & Compliance Seeding (Task 9)
  console.log('Seeding Privacy Policy...');
  const privacyPolicy = `
    Biometric Usage Policy
    ----------------------
    1. Data Collection: We collect face embeddings (mathematical representations of facial features) for the purpose of automated attendance and security.
    2. Purpose:
       - To mark student attendance automatically.
       - To enhance campus security via CCTV integration.
    3. Storage:
       - Data is stored as encrypted vector embeddings in our secure database.
       - Original images are deleted after processing (except for unknown faces retained for 7 days).
    4. Opt-out:
       - Participation is voluntary. Parents can opt-out at any time via the Parent App settings.
       - Upon opt-out, all biometric data is permanently deleted.
  `;

  await prisma.systemSetting.upsert({
    where: { key: 'PRIVACY_POLICY_BIOMETRIC' },
    update: {
      value: JSON.stringify({ text: privacyPolicy }),
      description: 'Privacy Policy clause for Biometric Usage',
    },
    create: {
      key: 'PRIVACY_POLICY_BIOMETRIC',
      value: JSON.stringify({ text: privacyPolicy }),
      description: 'Privacy Policy clause for Biometric Usage',
    },
  });
  console.log('Privacy Policy seeded.');

  // Password Policy Seeding (Restoring/Ensuring existence)
  const passwordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChar: true,
    lockoutThreshold: 5,
    expiryDays: 90,
  };

  await prisma.systemSetting.upsert({
    where: { key: 'SYSTEM_PASSWORD_POLICY' },
    update: {
      value: JSON.stringify(passwordPolicy),
      description: 'Global Password Security Policy',
    },
    create: {
      key: 'SYSTEM_PASSWORD_POLICY',
      value: JSON.stringify(passwordPolicy),
      description: 'Global Password Security Policy',
    },
  });
  console.log('Password Policy seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });