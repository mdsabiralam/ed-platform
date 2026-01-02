
import { OnlineExamService } from '../src/academic/online-exam/online-exam.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

// Mock implementation without Jest
const mockPrismaService = {
  onlineExam: {
    findUnique: async () => {
      // Mock exam data
      const now = new Date();
      return {
        id: 'exam-123',
        title: 'Test Exam',
        totalMarks: 20,
        negativeMarkingRate: 0.5,
        questions: [],
        startTime: new Date(now.getTime() - 600000),
        endTime: new Date(now.getTime() + 600000),
        isPublished: false, // Default for test 1
      };
    },
  },
  studentExamAttempt: {
    findFirst: async () => null,
    create: async ({ data }: any) => {
      return { id: 'attempt-1', ...data };
    }
  }
} as unknown as PrismaService;

async function verifySubmission() {
  console.log('Starting verification of OnlineExamService.submitQuiz...');

  const service = new OnlineExamService(mockPrismaService);
  const examId = 'exam-123';

  // Test 1: Submission when isPublished = false
  console.log('\n--- Test 1: Unpublished Exam Submission ---');
  // @ts-ignore
  mockPrismaService.onlineExam.findUnique = async () => ({
      id: 'exam-123',
      title: 'Unpublished Exam',
      totalMarks: 20,
      negativeMarkingRate: 0,
      questions: [],
      startTime: new Date(Date.now() - 1000),
      endTime: new Date(Date.now() + 100000),
      isPublished: false,
  });

  const result1: any = await service.submitQuiz(examId, 'student-1', []);
  console.log('Result 1:', result1);

  if (result1.message === 'Submission Successful. Results will be published later.') {
    console.log('✅ Correctly withheld score.');
  } else {
    throw new Error('Failed to withhold score for unpublished exam');
  }

  if (result1.score !== undefined) {
     throw new Error('Score should not be present in response');
  }


  // Test 2: Submission when isPublished = true
  console.log('\n--- Test 2: Published Exam Submission ---');
  // @ts-ignore
  mockPrismaService.onlineExam.findUnique = async () => ({
      id: 'exam-123',
      title: 'Published Exam',
      totalMarks: 20,
      negativeMarkingRate: 0,
      questions: [],
      startTime: new Date(Date.now() - 1000),
      endTime: new Date(Date.now() + 100000),
      isPublished: true,
  });

  const result2: any = await service.submitQuiz(examId, 'student-2', []);
  console.log('Result 2:', result2);

  if (result2.score !== undefined) {
    console.log('✅ Correctly returned score.');
  } else {
    throw new Error('Failed to return score for published exam');
  }

  console.log('\n✅ Verification successful!');
}

verifySubmission().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
