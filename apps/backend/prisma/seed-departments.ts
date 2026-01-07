import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding departments...');

  const departments = [
    { name: 'Academics' },
    { name: 'Admin' },
    { name: 'Transport' },
    { name: 'Maintenance' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: { name: dept.name },
    });
  }

  console.log('Departments seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
