import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionFilterDto } from './dto/question-filter.dto';

@Injectable()
export class QuestionBankService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        subjectId: createQuestionDto.subjectId,
        topicTag: createQuestionDto.topicTag,
        type: createQuestionDto.type as any,
        difficulty: createQuestionDto.difficulty as any,
        marks: createQuestionDto.marks,
        content: createQuestionDto.content,
        imageUrl: createQuestionDto.imageUrl,
        bloomsLevel: createQuestionDto.bloomsLevel as any,
        options: createQuestionDto.options,
        correctAnswer: createQuestionDto.correctAnswer,
      },
    });
  }

  async findAll(filters: QuestionFilterDto) {
    const { topicTag, difficulty, bloomsLevel, subjectId } = filters;
    return this.prisma.question.findMany({
      where: {
        ...(topicTag && { topicTag }),
        ...(difficulty && { difficulty: difficulty as any }),
        ...(bloomsLevel && { bloomsLevel: bloomsLevel as any }),
        ...(subjectId && { subjectId }),
      },
    });
  }

  async importQuestions(questions: CreateQuestionDto[]) {
    if (!questions || questions.length === 0) {
      throw new BadRequestException('No questions provided for import');
    }

    const subjectIds = [...new Set(questions.map((q) => q.subjectId))];

    // Verify all subjects exist
    const existingSubjectsCount = await this.prisma.subject.count({
      where: {
        id: { in: subjectIds },
      },
    });

    if (existingSubjectsCount !== subjectIds.length) {
      throw new BadRequestException('One or more subjectIds are invalid');
    }

    // Bulk create
    // Note: createMany is supported in Prisma for PostgreSQL
    return this.prisma.question.createMany({
      data: questions.map((q) => ({
        subjectId: q.subjectId,
        topicTag: q.topicTag,
        type: q.type as any,
        difficulty: q.difficulty as any,
        marks: q.marks,
        content: q.content,
        imageUrl: q.imageUrl,
        bloomsLevel: q.bloomsLevel as any,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    });
  }
}
