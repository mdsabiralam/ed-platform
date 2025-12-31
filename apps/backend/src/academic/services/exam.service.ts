import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteExam(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        _count: {
          select: { marks: true },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam._count.marks > 0) {
      throw new BadRequestException('Cannot delete exam with entered marks.');
    }

    return await this.prisma.exam.delete({
      where: { id },
    });
  }
}
