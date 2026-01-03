import { PrismaClient } from '@prisma/client';

async function verifyMerge() {
  console.log('Verifying Merge/Integration of Modules...');

  const prisma = new PrismaClient();

  // 1. Verify ResultSummary existence
  // We check if the delegate exists on the client instance.
  if ('resultSummary' in prisma) {
    console.log('PASS: ResultSummary model is accessible in Prisma Client.');
  } else {
    // Note: 'in' check might fail if types are strict, but runtime prop check works.
    // However, if we just run generation, it should be there.
    // Let's try to access it safely.
    try {
        const delegate = (prisma as any).resultSummary;
        if (delegate) {
            console.log('PASS: ResultSummary model is accessible via delegate.');
        } else {
            console.error('FAIL: ResultSummary delegate missing.');
            process.exit(1);
        }
    } catch (e) {
        console.error('FAIL: Error accessing ResultSummary:', e);
        process.exit(1);
    }
  }

  // 2. Verify SocialArtifact existence
  if ('socialArtifact' in prisma || (prisma as any).socialArtifact) {
      console.log('PASS: SocialArtifact model is accessible.');
  } else {
      console.error('FAIL: SocialArtifact model missing.');
      process.exit(1);
  }

  // 3. Verify Exam existence
  if ('exam' in prisma || (prisma as any).exam) {
      console.log('PASS: Exam model is accessible.');
  } else {
      console.error('FAIL: Exam model missing.');
      process.exit(1);
  }

  // 4. Verify GradingScale existence
  if ('gradingScale' in prisma || (prisma as any).gradingScale) {
      console.log('PASS: GradingScale model is accessible.');
  } else {
      console.error('FAIL: GradingScale model missing.');
      process.exit(1);
  }

  console.log('\nSUCCESS: All new models are present in the merged codebase.');
}

verifyMerge();
