
import { OnlineExamService } from '../src/academic/online-exam/online-exam.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

// Mock implementation without Jest
const mockPrismaService = {
  onlineExam: {
    findUnique: async () => {
      // Basic mock exam
      const now = new Date();
      return {
        id: 'exam-stress-1',
        title: 'Stress Test Exam',
        totalMarks: 100,
        negativeMarkingRate: 0,
        questions: [],
        startTime: new Date(now.getTime() - 100000),
        endTime: new Date(now.getTime() + 100000),
      };
    },
  },
  studentExamAttempt: {
    // Simulated DB with constraint
    _storage: new Set<string>(),

    create: async ({ data }: any) => {
      // Simulate network delay to allow race conditions if logic was flawed (e.g. check-then-act)
      // But here we are testing the mock's ability to throw on duplicate key
      const key = `${data.studentId}-${data.examId}`;

      // Simulate unique constraint check at "DB level"
      if (mockPrismaService.studentExamAttempt._storage.has(key)) {
        const error: any = new Error('Unique constraint violation');
        error.code = 'P2002';
        throw error;
      }

      mockPrismaService.studentExamAttempt._storage.add(key);
      return { id: 'attempt-' + Math.random(), ...data };
    }
  }
} as unknown as any;

async function runStressTest() {
  console.log('Starting concurrency stress test for OnlineExamService...');

  const service = new OnlineExamService(mockPrismaService);
  const examId = 'exam-stress-1';
  const studentId = 'student-stress-1';
  const concurrencyLevel = 100;

  console.log(`Firing ${concurrencyLevel} concurrent requests...`);

  const requests = Array.from({ length: concurrencyLevel }).map(async (_, index) => {
    try {
      await service.submitQuiz(examId, studentId, []);
      return { status: 'fulfilled', index };
    } catch (e) {
      return { status: 'rejected', error: e, index };
    }
  });

  const results = await Promise.all(requests);

  const successes = results.filter(r => r.status === 'fulfilled');
  const failures = results.filter(r => r.status === 'rejected');

  console.log(`\nResults:`);
  console.log(`Total Requests: ${concurrencyLevel}`);
  console.log(`Successes: ${successes.length}`);
  console.log(`Failures: ${failures.length}`);

  if (successes.length === 1 && failures.length === 99) {
    // Verify failures are ConflictExceptions
    const allConflicts = failures.every((f: any) => f.error instanceof ConflictException);
    if (allConflicts) {
      console.log('✅ PASS: Exactly 1 success and 99 ConflictExceptions.');
    } else {
      console.log('❌ FAIL: Some failures were not ConflictExceptions.');
      console.log(failures[0].error);
    }
  } else {
    console.log('❌ FAIL: Incorrect success/failure ratio.');
  }
}

runStressTest().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
