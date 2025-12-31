import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'default-tenant-id'; // In a real app, this might come from env or admin setup

  // 1. Create CBSE Standard Scale
  console.log('Seeding CBSE Standard Grading Scale...');

  const cbseScale = await prisma.gradingScale.create({
    data: {
      tenantId, // Assuming a default tenant exists or this seed is run per tenant
      name: 'CBSE Standard (IX-X)',
      type: 'SCHOLASTIC',
      isMarksBased: true,
      logic: {
        create: [
          { minScore: 91, maxScore: 100, gradePoint: 10.0, label: 'A1' },
          { minScore: 81, maxScore: 90, gradePoint: 9.0, label: 'A2' },
          { minScore: 71, maxScore: 80, gradePoint: 8.0, label: 'B1' },
          { minScore: 61, maxScore: 70, gradePoint: 7.0, label: 'B2' },
          { minScore: 51, maxScore: 60, gradePoint: 6.0, label: 'C1' },
          { minScore: 41, maxScore: 50, gradePoint: 5.0, label: 'C2' },
          { minScore: 33, maxScore: 40, gradePoint: 4.0, label: 'D' },
          { minScore: 0, maxScore: 32, gradePoint: 0.0, label: 'E' }, // Fail
        ],
      },
    },
  });

  console.log(`Created Grading Scale: ${cbseScale.name}`);

  // 2. Create Co-Scholastic Scale (A-E)
  const coScholasticScale = await prisma.gradingScale.create({
    data: {
      tenantId,
      name: 'Co-Scholastic (A-E)',
      type: 'CO_SCHOLASTIC',
      isMarksBased: false, // Direct Grade Entry
      logic: {
        create: [
          { minScore: 0, maxScore: 0, gradePoint: 5.0, label: 'A' },
          { minScore: 0, maxScore: 0, gradePoint: 4.0, label: 'B' },
          { minScore: 0, maxScore: 0, gradePoint: 3.0, label: 'C' },
          { minScore: 0, maxScore: 0, gradePoint: 2.0, label: 'D' },
          { minScore: 0, maxScore: 0, gradePoint: 1.0, label: 'E' },
        ],
      },
    },
  });

  console.log(`Created Grading Scale: ${coScholasticScale.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
