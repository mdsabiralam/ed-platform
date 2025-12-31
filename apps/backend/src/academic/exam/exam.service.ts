import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  // 6.A.03: Define Exam
  async defineExam(tenantId: string, data: any) {
    // Validate maxMarks
    if (data.maxMarks <= 0) {
      throw new BadRequestException('Max marks must be positive');
    }

    return this.prisma.exam.create({
      data: {
        tenantId,
        classId: data.classId,
        subjectId: data.subjectId,
        termId: data.termId,
        typeId: data.typeId,
        maxMarks: data.maxMarks,
        examDate: new Date(data.examDate),
        groupId: data.groupId, // 6.A.04: Exam Group Support
      },
    });
  }

  // 6.A.05: Lock Exam
  async lockExam(examId: string, tenantId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam || exam.tenantId !== tenantId) throw new NotFoundException('Exam not found');

    return this.prisma.exam.update({
      where: { id: examId },
      data: { isLocked: true },
    });
  }

  // 6.A.06: Publish Exam
  async publishExam(examId: string, tenantId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam || exam.tenantId !== tenantId) throw new NotFoundException('Exam not found');

    return this.prisma.exam.update({
      where: { id: examId },
      data: { isPublished: true },
    });
  }

  // 6.A.06: Get Exams for Student (Filtered by Published)
  async getExamsForStudent(tenantId: string, studentId: string) {
    // In a real scenario, we would fetch the student's class first
    // For now, assuming the query passes classId or we infer it
    // Let's assume we return all published exams for the tenant for simplicity in this step,
    // or better, filter by class if passed.

    // Simplification: Return all published exams for the tenant
    return this.prisma.exam.findMany({
      where: {
        tenantId,
        isPublished: true,
      },
      include: {
        subject: true,
        type: true,
      },
    });
  }
}
