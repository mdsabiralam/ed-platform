import { PrismaClient } from '@prisma/client';
import { getGrade, GradingScaleRule } from '../common/utils/grading.util';

async function main() {
  console.log('Verifying Grading Logic...');

  // 1. Fetch the 'CBSE Standard' grading scale from the database.
  let cbseRules: GradingScaleRule[] | null = null;
  const cbseId = '11111111-1111-1111-1111-111111111111';

  if (process.env.DATABASE_URL) {
    try {
      const prisma = new PrismaClient();
      const scale = await prisma.gradingScale.findUnique({
        where: { id: cbseId },
      });
      if (scale) {
        console.log('Successfully fetched Grading Scale from DB.');
        cbseRules = scale.rules as unknown as GradingScaleRule[];
      } else {
        console.warn('Grading Scale not found in DB (expected if DB is empty).');
      }
      await prisma.$disconnect();
    } catch (error) {
      console.warn('Database connection failed despite DATABASE_URL being set.', error.message);
    }
  } else {
    console.warn('Skipping DB fetch: DATABASE_URL not set. Using mock/seed data for verification.');
  }

  // Fallback to manual definition if DB fetch fails or is skipped
  if (!cbseRules) {
     console.log('Using fallback/seeded rules for verification...');
     cbseRules = [
      { min: 91, max: 100, grade: 'A1', description: 'Top 1/8th of the passed candidates' },
      { min: 81, max: 90, grade: 'A2', description: 'Next 1/8th of the passed candidates' },
      { min: 71, max: 80, grade: 'B1', description: 'Next 1/8th of the passed candidates' },
      { min: 61, max: 70, grade: 'B2', description: 'Next 1/8th of the passed candidates' },
      { min: 51, max: 60, grade: 'C1', description: 'Next 1/8th of the passed candidates' },
      { min: 41, max: 50, grade: 'C2', description: 'Next 1/8th of the passed candidates' },
      { min: 33, max: 40, grade: 'D', description: 'Next 1/8th of the passed candidates' },
      { min: 0, max: 32, grade: 'E', description: 'Failed' },
    ];
  }

  // 2. Run a test function `getGrade(score)` with inputs.
  console.log('\nRunning tests:');

  const testCases = [
    { input: 95, expected: 'A1' },
    { input: 32, expected: 'E' },
    { input: 90.5, expected: 'A2' }, // 90.5 -> floor(90.5) = 90 -> A2 (81-90)
  ];

  let passed = true;

  for (const test of testCases) {
    const actual = getGrade(test.input, cbseRules);
    console.log(`Input: ${test.input} -> Expected: ${test.expected}, Actual: ${actual}`);

    if (actual !== test.expected) {
      console.error(`FAILED: Expected ${test.expected} but got ${actual}`);
      passed = false;
    } else {
        console.log('PASS');
    }
  }

  // 3. Confirm that the system correctly maps numerical scores to Grade Labels.
  if (passed) {
    console.log('\nSUCCESS: System correctly maps numerical scores to Grade Labels.');
  } else {
    console.error('\nFAILURE: Some tests failed.');
    process.exit(1);
  }
}

main();
