import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarksService {
  constructor(private readonly prisma: PrismaService) {}

  // 6.D.02: Update Marks (Single)
  async updateMarks(tenantId: string, data: any) {
    const { studentId, examId, subjectId, theory, practical, isAbsent, remarks } = data;

    // 6.D.05: Validate against Max Marks
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new BadRequestException('Exam not found');

    if ((theory + practical) > exam.maxMarks) {
        throw new BadRequestException('Total marks cannot exceed Max Marks');
    }

    return this.prisma.studentMark.upsert({
      where: {
        studentId_examId_subjectId: {
          studentId,
          examId,
          subjectId,
        },
      },
      update: {
        theoryMarks: theory,
        practicalMarks: practical,
        totalMarks: isAbsent ? 0 : (theory + practical),
        isAbsent,
        remarks,
      },
      create: {
        studentId,
        examId,
        subjectId,
        theoryMarks: theory,
        practicalMarks: practical,
        totalMarks: isAbsent ? 0 : (theory + practical),
        isAbsent,
        remarks,
      },
    });
  }

  // 6.D.03: Bulk Upload
  async bulkUploadMarks(tenantId: string, marksData: any[]) {
      const results = { success: 0, errors: [] };

      for (const entry of marksData) {
          try {
              await this.updateMarks(tenantId, entry);
              results.success++;
          } catch (e) {
              results.errors.push({ entry, error: e.message });
          }
      }
      return results;
  }
}
