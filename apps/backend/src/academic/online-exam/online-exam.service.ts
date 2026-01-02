import { Injectable } from '@nestjs/common';
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
  ) {
    // 1. Fetch correct answers from DB
    const exam = await this.prisma.onlineExam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    let score = 0;
    const questionsMap = new Map(exam.questions.map((q) => [q.id, q]));

    // 2. Loop through user answers
    for (const answer of answers) {
      const question = questionsMap.get(answer.questionId);
      if (question) {
        // 3. If correct, add marks. If wrong, deduct marks.
        if (question.correctAnswer === answer.selectedOption) {
          score += question.marks;
        } else {
          // Negative marking
          score -= question.marks * exam.negativeMarkingRate;
        }
      }
    }

    // 4. Save the total score to StudentExamAttempt table immediately
    const attempt = await this.prisma.studentExamAttempt.create({
      data: {
        examId,
        studentId,
        score,
        totalMarks: exam.totalMarks,
        attemptedAt: new Date(),
      },
    });

    return attempt;
  }
}
