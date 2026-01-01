import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMarkDto {
  @ApiProperty() studentId: string;
  @ApiProperty() examId: string;
  @ApiProperty() subjectId: string;
  @ApiProperty() theory: number;
  @ApiProperty() practical: number;
  @ApiProperty() isAbsent: boolean;
}

@Injectable()
export class MarksService {
  constructor(private prisma: PrismaService) {}

  async updateMark(tenantId: string, dto: UpdateMarkDto) {
    // 1. Fetch Exam configuration (Source 6.A)
    // We assume examId is valid and exists
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.examId },
    });

    if (!exam) throw new NotFoundException('Exam not found');
    if (exam.tenantId !== tenantId) throw new BadRequestException('Invalid Exam for this tenant');

    // 2. Validate Marks (6.D.05)
    if (dto.theory > exam.maxTheory) {
        throw new BadRequestException(`Theory marks cannot exceed ${exam.maxTheory}`);
    }
    if (dto.practical > exam.maxPractical) {
        throw new BadRequestException(`Practical marks cannot exceed ${exam.maxPractical}`);
    }

    // 3. Calculate Total
    let total = dto.theory + dto.practical;
    if (dto.isAbsent) {
        // If absent, logic says "ensure total_marks is treated accordingly".
        // Usually absent means 0 total, or retained as is but flagged?
        // Prompt says "e.g., 0". So I'll set to 0.
        total = 0;
    }

    // 4. Upsert
    return this.prisma.studentMark.upsert({
      where: {
        examId_studentId_subjectId: {
          examId: dto.examId,
          studentId: dto.studentId,
          subjectId: dto.subjectId,
        },
      },
      update: {
        theoryMarks: dto.theory,
        practicalMarks: dto.practical,
        totalMarks: total,
        isAbsent: dto.isAbsent,
      },
      create: {
        examId: dto.examId,
        studentId: dto.studentId,
        subjectId: dto.subjectId,
        theoryMarks: dto.theory,
        practicalMarks: dto.practical,
        totalMarks: total,
        isAbsent: dto.isAbsent,
      },
    });
  }

  async bulkUploadMarks(tenantId: string, dtos: UpdateMarkDto[]) {
      // 6.D.03 Bulk Upload
      let successCount = 0;
      let errorCount = 0;
      const errors: any[] = [];

      // Optimization: Fetch unique exams first
      const examIds = [...new Set(dtos.map(d => d.examId))];
      const exams = await this.prisma.exam.findMany({
          where: { id: { in: examIds } }
      });
      const examMap = new Map(exams.map(e => [e.id, e]));

      // Fetch students to validate class membership
      const studentIds = [...new Set(dtos.map(d => d.studentId))];
      const students = await this.prisma.student.findMany({
          where: { id: { in: studentIds } },
          include: { section: true }
      });
      const studentMap = new Map(students.map(s => [s.id, s]));

      for (const dto of dtos) {
          try {
              const exam = examMap.get(dto.examId);
              if (!exam) throw new NotFoundException('Exam not found');
              if (exam.tenantId !== tenantId) throw new BadRequestException('Invalid Exam');

              const student = studentMap.get(dto.studentId);
              if (!student) throw new NotFoundException('Student not found');

              // Validate Student Class Membership
              // exam.classId must match student.section.classId
              if (student.section?.classId !== exam.classId) {
                  throw new BadRequestException('Student does not belong to the exam class');
              }

              if (dto.theory > exam.maxTheory) {
                throw new BadRequestException(`Theory marks cannot exceed ${exam.maxTheory}`);
              }
              if (dto.practical > exam.maxPractical) {
                throw new BadRequestException(`Practical marks cannot exceed ${exam.maxPractical}`);
              }

              let total = dto.theory + dto.practical;
              if (dto.isAbsent) total = 0;

              await this.prisma.studentMark.upsert({
                  where: {
                    examId_studentId_subjectId: {
                        examId: dto.examId,
                        studentId: dto.studentId,
                        subjectId: dto.subjectId,
                    },
                  },
                  update: {
                    theoryMarks: dto.theory,
                    practicalMarks: dto.practical,
                    totalMarks: total,
                    isAbsent: dto.isAbsent,
                  },
                  create: {
                    examId: dto.examId,
                    studentId: dto.studentId,
                    subjectId: dto.subjectId,
                    theoryMarks: dto.theory,
                    practicalMarks: dto.practical,
                    totalMarks: total,
                    isAbsent: dto.isAbsent,
                  },
              });
              successCount++;
          } catch (e: any) {
              errorCount++;
              errors.push({ studentId: dto.studentId, error: e.message });
          }
      }

      return { successCount, errorCount, errors };
  }
}
