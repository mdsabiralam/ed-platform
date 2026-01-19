import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkMarksDto } from './marks.dto';

@Injectable()
export class MarksService {
  constructor(private readonly prisma: PrismaService) {}

  async recordBulk(dto: BulkMarksDto) {
    // Validate all records before saving
    for (const record of dto.records) {
      const exam = await this.prisma.exam.findUnique({ where: { id: record.examId } });

      if (!exam) {
        throw new BadRequestException(`Exam with ID ${record.examId} not found`);
      }

      if (record.marks > exam.maxMarks) {
        throw new BadRequestException(`Marks for student ${record.studentId} cannot exceed ${exam.maxMarks}. Given: ${record.marks}`);
      }
    }

    // Save
    const saved = [];
    await this.prisma.$transaction(async (tx) => {
        for (const record of dto.records) {
            const mark = await tx.studentMark.create({
                 data: {
                    studentId: record.studentId,
                    examId: record.examId,
                    subject: record.subject,
                    marks: record.marks
                 }
            });
            saved.push(mark);
        }
    });

    return { success: true, count: saved.length };
  }
}
