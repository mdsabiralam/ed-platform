import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedGradingScales(prismaClient?: PrismaClient) {
  const db = prismaClient || prisma;
  console.log('Seeding grading scales...');

  // 1. CBSE Secondary
  const cbseSecondary = {
    name: 'CBSE Secondary',
    type: 'SCHOLASTIC',
    isMarksBased: true,
    logics: [
      { label: 'A1', minScore: 91, maxScore: 100, gradePoint: 10.0 },
      { label: 'A2', minScore: 81, maxScore: 90, gradePoint: 9.0 },
      { label: 'B1', minScore: 71, maxScore: 80, gradePoint: 8.0 },
      { label: 'B2', minScore: 61, maxScore: 70, gradePoint: 7.0 },
      { label: 'C1', minScore: 51, maxScore: 60, gradePoint: 6.0 },
      { label: 'C2', minScore: 41, maxScore: 50, gradePoint: 5.0 },
      { label: 'D',  minScore: 33, maxScore: 40, gradePoint: 4.0 },
      { label: 'E',  minScore: 0,  maxScore: 32, gradePoint: 0.0 }, // Fail
    ]
  };

  // 2. ICSE Standard (Approximation based on common practice)
  const icseStandard = {
    name: 'ICSE Standard',
    type: 'SCHOLASTIC',
    isMarksBased: true,
    logics: [
        { label: '1', minScore: 90, maxScore: 100, gradePoint: 1.0 },
        { label: '2', minScore: 80, maxScore: 89, gradePoint: 2.0 },
        { label: '3', minScore: 70, maxScore: 79, gradePoint: 3.0 },
        { label: '4', minScore: 60, maxScore: 69, gradePoint: 4.0 },
        { label: '5', minScore: 50, maxScore: 59, gradePoint: 5.0 },
        { label: '6', minScore: 40, maxScore: 49, gradePoint: 6.0 },
        { label: '7', minScore: 35, maxScore: 39, gradePoint: 7.0 },
        { label: '8', minScore: 30, maxScore: 34, gradePoint: 8.0 },
        { label: '9', minScore: 0,  maxScore: 29, gradePoint: 9.0 },
    ]
  };

  // 3. Co-Scholastic (General)
  const coScholastic = {
    name: 'General Co-Scholastic',
    type: 'CO_SCHOLASTIC',
    isMarksBased: false,
    logics: [
        { label: 'A', gradePoint: 3.0 }, // Outstanding
        { label: 'B', gradePoint: 2.0 }, // Very Good
        { label: 'C', gradePoint: 1.0 }, // Fair
    ]
  };

  const scales = [cbseSecondary, icseStandard, coScholastic];

  for (const scaleData of scales) {
    const existing = await db.gradingScale.findFirst({
        where: { name: scaleData.name, tenantId: null }
    });

    if (!existing) {
        const scale = await db.gradingScale.create({
          data: {
            name: scaleData.name,
            type: scaleData.type,
            isMarksBased: scaleData.isMarksBased,
            gradingLogics: {
                create: scaleData.logics
            }
          }
        });
        console.log(`Created Grading Scale: ${scale.name}`);
    } else {
        console.log(`Grading Scale already exists: ${scaleData.name}`);
    }
  }
}

if (require.main === module) {
  seedGradingScales()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
