import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionBankService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    // Cast the enums to the Prisma generated types if needed,
    // or rely on strict typing from DTO if it matches.
    // Ideally we would import enums from @prisma/client, but we'll use 'any' or explicit cast
    // to avoid build errors if the client isn't regenerated yet in the sandbox.

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
}
