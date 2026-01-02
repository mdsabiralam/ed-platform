
import { OnlineExamService } from '../src/academic/online-exam/online-exam.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

// Mock implementation without Jest
const mockPrismaService = {
  onlineExam: {
    findUnique: async () => {
       // Mock data
      const mockQuestions = [
        { id: 'q1', text: 'Q1', correctAnswer: 'A', marks: 5, options: JSON.stringify(['A', 'B']) },
        { id: 'q2', text: 'Q2', correctAnswer: 'B', marks: 10, options: JSON.stringify(['A', 'B']) },
        { id: 'q3', text: 'Q3', correctAnswer: 'C', marks: 5, options: JSON.stringify(['A', 'B']) },
      ];

      const now = new Date();
      const mockExam = {
        id: 'exam-123',
        title: 'Test Exam',
        totalMarks: 20,
        negativeMarkingRate: 0.5,
        questions: mockQuestions,
        startTime: new Date(now.getTime() - 600000), // Started 10 mins ago
        endTime: new Date(now.getTime() + 600000),   // Ends in 10 mins
      };
      return mockExam;
    },
  },
  studentExamAttempt: {
    findFirst: async ({ where }: any) => {
      if (where.studentId === 'student-submitted') {
        return { id: 'existing-attempt' };
      }
      return null;
    },
    create: async ({ data }: any) => {
      console.log('Mock creating attempt with timeSpent:', data.timeSpent);
      return { id: 'attempt-1', ...data };
    }
  }
} as unknown as PrismaService;

async function verifySubmission() {
  console.log('Starting verification of OnlineExamService.submitQuiz...');

  const service = new OnlineExamService(mockPrismaService);
  const examId = 'exam-123';
  const timeSpent = { 'q1': 30, 'q2': 45, 'q3': 10 };

  // Test 1: Successful Submission with Time Spent
  console.log('\n--- Test 1: Successful Submission with Heatmap Data ---');
  try {
    const result: any = await service.submitQuiz(
      examId,
      'student-new',
      [
       { questionId: 'q1', selectedOption: 'A' },
       { questionId: 'q2', selectedOption: 'A' },
       { questionId: 'q3', selectedOption: 'C' },
      ],
      timeSpent
    );
    console.log('Submission Result:', result);
    if (result.score !== 5) throw new Error('Incorrect score');
    if (JSON.stringify(result.timeSpent) !== JSON.stringify(timeSpent)) throw new Error('Incorrect timeSpent data');
    console.log('✅ Success');
  } catch (e) {
    console.error('❌ Failed:', e);
    throw e;
  }

  // Test 2: Double Submission
  console.log('\n--- Test 2: Double Submission ---');
  try {
    await service.submitQuiz(examId, 'student-submitted', [], {});
    throw new Error('Should have thrown ConflictException');
  } catch (e) {
    if (e instanceof ConflictException) {
      console.log('✅ Correctly caught ConflictException');
    } else {
      console.error('❌ Wrong error type:', e);
      throw e;
    }
  }

  console.log('\n✅ Verification successful!');
}

verifySubmission().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
