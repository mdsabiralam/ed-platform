import { PrismaClient } from '@prisma/client';
import { GradingScaleRule } from '../src/common/utils/grading.util';

const prisma = new PrismaClient();

const cbseStandardRules: GradingScaleRule[] = [
  { min: 91, max: 100, grade: 'A1', description: 'Top 1/8th of the passed candidates' },
  { min: 81, max: 90, grade: 'A2', description: 'Next 1/8th of the passed candidates' },
  { min: 71, max: 80, grade: 'B1', description: 'Next 1/8th of the passed candidates' },
  { min: 61, max: 70, grade: 'B2', description: 'Next 1/8th of the passed candidates' },
  { min: 51, max: 60, grade: 'C1', description: 'Next 1/8th of the passed candidates' },
  { min: 41, max: 50, grade: 'C2', description: 'Next 1/8th of the passed candidates' },
  { min: 33, max: 40, grade: 'D', description: 'Next 1/8th of the passed candidates' },
  { min: 0, max: 32, grade: 'E', description: 'Failed' },
];

async function main() {
  console.log('Seeding grading scales...');

  const cbseId = '11111111-1111-1111-1111-111111111111';

  await prisma.gradingScale.upsert({
    where: { id: cbseId },
    update: {
      rules: cbseStandardRules as any, // Cast to any because Prisma Json type input might need specific handling or strict type mismatch with interface
    },
    create: {
      id: cbseId,
      tenantId: null, // Global
      name: 'CBSE Standard',
      isMarksBased: true,
      rules: cbseStandardRules as any,
    },
  });

  console.log('Grading scales seeded.');
}

// Allow running directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { main as seedGradingScales };
