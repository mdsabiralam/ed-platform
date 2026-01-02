import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cbseScale = {
  name: 'CBSE Standard',
  isMarksBased: true,
  tenantId: null, // Global scale
  rules: [
    { minScore: 91, maxScore: 100, gradeLabel: 'A1' },
    { minScore: 81, maxScore: 91, gradeLabel: 'A2' }, // < 91
    { minScore: 71, maxScore: 81, gradeLabel: 'B1' }, // < 81
    { minScore: 61, maxScore: 71, gradeLabel: 'B2' },
    { minScore: 51, maxScore: 61, gradeLabel: 'C1' },
    { minScore: 41, maxScore: 51, gradeLabel: 'C2' },
    { minScore: 33, maxScore: 41, gradeLabel: 'D' },
    { minScore: 0, maxScore: 33, gradeLabel: 'E' },
  ],
};

async function main() {
  console.log('Seeding grading scales...');

  const scale = await prisma.gradingScale.upsert({
    where: { id: '11111111-1111-1111-1111-111111111111' },
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      name: cbseScale.name,
      isMarksBased: cbseScale.isMarksBased,
      tenantId: cbseScale.tenantId,
      rules: {
        create: cbseScale.rules,
      },
    },
    update: {
      name: cbseScale.name,
      // Re-creating rules is safer for updates to ensure consistency
      rules: {
        deleteMany: {},
        create: cbseScale.rules,
      },
    },
  });

  console.log('Seeded Grading Scale:', scale.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
