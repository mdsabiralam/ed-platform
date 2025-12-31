import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const standardTypes = [
    { name: 'Theory', description: 'Written examination' },
    { name: 'Practical', description: 'Lab or hands-on assessment' },
    { name: 'Viva', description: 'Oral examination' },
    { name: 'Project', description: 'Project submission' },
    { name: 'Assignment', description: 'Take-home assignment' },
  ];

  console.log('Seeding Exam Types...');
  for (const type of standardTypes) {
    // Upsert to avoid duplicates
    // Note: Since ID is UUID, we might need to check by name if we want to be idempotent logic without fixed IDs.
    // For simplicity in this seed, we just create if not exists or use a findFirst logic.
    // However, ExamType in schema usually has an ID.
    // We will assume this is a global seed.

    // Check if exists
    const existing = await prisma.examType.findFirst({ where: { name: type.name } });
    if (!existing) {
        await prisma.examType.create({ data: type });
    }
  }
  console.log('Exam Types seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
