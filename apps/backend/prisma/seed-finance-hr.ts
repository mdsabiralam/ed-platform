import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ১. যেকোনো একটি টেন্যান্ট খুঁজে বের করা
  let institute = await prisma.institute.findFirst();

  // যদি কোনো টেন্যান্ট না থাকে, তবে একটি ডিফল্ট টেন্যান্ট তৈরি করা
  if (!institute) {
    console.log('No institute found. Creating a default institute...');
    institute = await prisma.institute.create({
      data: {
        name: 'Default School',
        subdomain: 'default-school',
        subscriptionStatus: 'ACTIVE',
      },
    });
    console.log(`✅ Default institute "${institute.name}" created.`);
  }

  console.log(`🌱 Seeding Finance & HR data for institute: ${institute.name}`);

  // 2.H.06 Finance: Chart of Accounts (Standard Setup)
  const coaData = [
    { code: '1000', name: 'Assets', type: 'ASSET' },
    { code: '1001', name: 'Cash in Hand', type: 'ASSET' },
    { code: '1002', name: 'Bank Accounts', type: 'ASSET' },
    { code: '2000', name: 'Liabilities', type: 'LIABILITY' },
    { code: '3000', name: 'Equity', type: 'EQUITY' },
    { code: '4000', name: 'Revenue', type: 'REVENUE' },
    { code: '4001', name: 'Tuition Fees', type: 'REVENUE' },
    { code: '4002', name: 'Admission Fees', type: 'REVENUE' },
    { code: '5000', name: 'Expenses', type: 'EXPENSE' },
    { code: '5001', name: 'Staff Salaries', type: 'EXPENSE' },
    { code: '5002', name: 'Utility Bills', type: 'EXPENSE' },
  ];

  for (const acc of coaData) {
    await prisma.chartOfAccount.upsert({
      where: {
        instituteId_code: {
          instituteId: institute.id,
          code: acc.code,
        },
      },
      update: {},
      create: {
        instituteId: institute.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        isSystem: true,
      },
    });
  }
  console.log('✅ Chart of Accounts seeded.');

  // 2.H.07 HR: Leave Types (Standard HR Setup)
  const leaveData = [
    { code: 'CL', name: 'Casual Leave', daysAllowed: 14, isPaid: true },
    { code: 'SL', name: 'Sick Leave', daysAllowed: 14, isPaid: true },
    { code: 'PL', name: 'Privilege Leave', daysAllowed: 30, isPaid: true },
    { code: 'LWP', name: 'Leave Without Pay', daysAllowed: 0, isPaid: false },
  ];

  for (const leave of leaveData) {
    await prisma.leaveType.upsert({
      where: {
        instituteId_code: {
          instituteId: institute.id,
          code: leave.code,
        },
      },
      update: {},
      create: {
        instituteId: institute.id,
        code: leave.code,
        name: leave.name,
        daysAllowed: leave.daysAllowed,
        isPaid: leave.isPaid,
      },
    });
  }
  console.log('✅ Leave Types seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
