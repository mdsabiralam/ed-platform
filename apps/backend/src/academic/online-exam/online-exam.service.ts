import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OnlineExamService {
  constructor(private prisma: PrismaService) {}

  async startQuiz(studentId: string, examId: string) {
    // 1. Fetch questions linked to the exam
    const exam = await this.prisma.onlineExam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    // 2. Randomize/Shuffle the order of questions specifically for this student session
    // Using Fisher-Yates shuffle algorithm
    const shuffledQuestions = this.shuffleArray([...exam.questions]);

    // 3. Return the question list WITHOUT the correctAnswer field
    return shuffledQuestions.map((question) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correctAnswer, ...questionWithoutAnswer } = question;
      return questionWithoutAnswer;
    });
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async submitQuiz(
    examId: string,
    studentId: string,
    answers: { questionId: string; selectedOption: string }[],
    timeSpent?: Record<string, number>,
  ) {
    // 1. Fetch exam details first
    const exam = await this.prisma.onlineExam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // 2. Time Validation
    const now = new Date();
    const bufferMinutes = 5;
    const endTimeWithBuffer = new Date(exam.endTime.getTime() + bufferMinutes * 60000);

    if (now < exam.startTime) {
      throw new BadRequestException('Exam has not started yet.');
    }

    if (now > endTimeWithBuffer) {
      throw new BadRequestException('Exam submission time has passed.');
    }

    // 3. Grading Logic (Moved before DB write to keep transaction short)
    let score = 0;
    const questionsMap = new Map(exam.questions.map((q) => [q.id, q]));

    for (const answer of answers) {
      const question = questionsMap.get(answer.questionId);
      if (question) {
        if (question.correctAnswer === answer.selectedOption) {
          score += question.marks;
        } else {
          score -= question.marks * exam.negativeMarkingRate;
        }
      }
    }

    // 4. Atomic Save with Duplicate Check handling
    try {
      const attempt = await this.prisma.studentExamAttempt.create({
        data: {
          examId,
          studentId,
          score,
          totalMarks: exam.totalMarks,
          timeSpent: timeSpent as any,
          attemptedAt: new Date(),
        },
      });
      return attempt;
    } catch (error: any) {
      // P2002: Unique constraint violation
      if (error.code === 'P2002') {
        throw new ConflictException('Exam already submitted by this student.');
      }
      throw error;
    }
  }
}
