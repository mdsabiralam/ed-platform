import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔒 Seeding Security Configurations...');

  // 2.I.08 Password Policies
  const passwordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    preventReuse: 3,
    lockoutThreshold: 5, // 5 failed attempts locks account
    lockoutDuration: 15 // minutes
  };

  await prisma.globalConfig.upsert({
    where: { key: 'password_policy' },
    update: { value: passwordPolicy },
    create: {
      key: 'password_policy',
      value: passwordPolicy,
      description: 'Global password complexity and rotation policies'
    }
  });

  console.log('✅ Password policies seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
