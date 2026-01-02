import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GradingService } from './grading.service';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMarkDto {
  @ApiProperty() studentId: string;
  @ApiProperty() examId: string;
  @ApiProperty() subjectId: string;
  @ApiProperty() theory: number;
  @ApiProperty() practical: number;
  @ApiProperty() isAbsent: boolean;
  @ApiProperty({ required: false }) gradeLabel?: string;
  @ApiProperty({ required: false }) remarks?: string;
}

@Injectable()
export class MarksService {
  constructor(
      private prisma: PrismaService,
      private gradingService: GradingService
  ) {}

  private async checkLockStatus(examId: string) {
    const status = await this.prisma.markEntryStatus.findUnique({
        where: { examId }
    });
    if (status && (status.status === 'PENDING_APPROVAL' || status.status === 'APPROVED')) {
        throw new ForbiddenException('Marks are locked for this exam');
    }
  }

  async updateMark(tenantId: string, dto: UpdateMarkDto) {
    await this.checkLockStatus(dto.examId);

    // 1. Fetch Exam configuration
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.examId },
    });

    if (!exam) throw new NotFoundException('Exam not found');
    if (exam.tenantId !== tenantId) throw new BadRequestException('Invalid Exam for this tenant');

    // Resolve Grading Scale
    const gradingScale = await this.gradingService.getGradingScaleForSubject(tenantId, exam.subjectId, exam.classId);

    let theory = dto.theory;
    let practical = dto.practical;

    if (gradingScale && !gradingScale.isMarksBased) {
        // Co-Scholastic Logic
        if (!dto.gradeLabel) {
            throw new BadRequestException('Grade label is required for co-scholastic subjects');
        }
        // Validate label exists in logics
        const isValidLabel = gradingScale.gradingLogics.some(l => l.label === dto.gradeLabel);
        if (!isValidLabel) {
             throw new BadRequestException(`Invalid grade label. Allowed: ${gradingScale.gradingLogics.map(l => l.label).join(', ')}`);
        }
        // Force marks to 0
        theory = 0;
        practical = 0;
    } else {
        // Scholastic Logic
        // 2. Validate Marks
        if (theory > exam.maxTheory) {
            throw new BadRequestException(`Theory marks cannot exceed ${exam.maxTheory}`);
        }
        if (practical > exam.maxPractical) {
            throw new BadRequestException(`Practical marks cannot exceed ${exam.maxPractical}`);
        }
    }

    // 3. Calculate Total
    let total = theory + practical;
    if (dto.isAbsent) {
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
        theoryMarks: theory,
        practicalMarks: practical,
        totalMarks: total,
        isAbsent: dto.isAbsent,
        gradeLabel: gradingScale?.isMarksBased === false ? dto.gradeLabel : null,
        remarks: dto.remarks,
      },
      create: {
        examId: dto.examId,
        studentId: dto.studentId,
        subjectId: dto.subjectId,
        theoryMarks: theory,
        practicalMarks: practical,
        totalMarks: total,
        isAbsent: dto.isAbsent,
        gradeLabel: gradingScale?.isMarksBased === false ? dto.gradeLabel : null,
        remarks: dto.remarks,
      },
    });
  }

  async bulkUploadMarks(tenantId: string, dtos: UpdateMarkDto[]) {
      let successCount = 0;
      let errorCount = 0;
      const errors: any[] = [];

      const examIds = [...new Set(dtos.map(d => d.examId))];

      const locks = await this.prisma.markEntryStatus.findMany({
          where: { examId: { in: examIds } }
      });
      const lockedExamIds = new Set(locks.filter(l => l.status === 'PENDING_APPROVAL' || l.status === 'APPROVED').map(l => l.examId));

      const exams = await this.prisma.exam.findMany({
          where: { id: { in: examIds } }
      });
      const examMap = new Map(exams.map(e => [e.id, e]));

      // Cache grading scales
      const scaleCache = new Map<string, any>(); // key: subjectId_classId

      const studentIds = [...new Set(dtos.map(d => d.studentId))];
      const students = await this.prisma.student.findMany({
          where: { id: { in: studentIds } },
          include: { section: true }
      });
      const studentMap = new Map(students.map(s => [s.id, s]));

      for (const dto of dtos) {
          try {
              if (lockedExamIds.has(dto.examId)) {
                  throw new ForbiddenException('Marks are locked for this exam');
              }

              const exam = examMap.get(dto.examId);
              if (!exam) throw new NotFoundException('Exam not found');
              if (exam.tenantId !== tenantId) throw new BadRequestException('Invalid Exam');

              const student = studentMap.get(dto.studentId);
              if (!student) throw new NotFoundException('Student not found');

              if (student.section?.classId !== exam.classId) {
                  throw new BadRequestException('Student does not belong to the exam class');
              }

              // Resolve Grading Scale
              const cacheKey = `${exam.subjectId}_${exam.classId}`;
              let gradingScale = scaleCache.get(cacheKey);
              if (!gradingScale) {
                   gradingScale = await this.gradingService.getGradingScaleForSubject(tenantId, exam.subjectId, exam.classId);
                   scaleCache.set(cacheKey, gradingScale);
              }

              let theory = dto.theory;
              let practical = dto.practical;
              let gradeLabel = null;

              if (gradingScale && !gradingScale.isMarksBased) {
                   if (!dto.gradeLabel) throw new BadRequestException('Grade label is required');
                   const isValidLabel = gradingScale.gradingLogics.some((l: any) => l.label === dto.gradeLabel);
                   if (!isValidLabel) throw new BadRequestException('Invalid grade label');
                   theory = 0;
                   practical = 0;
                   gradeLabel = dto.gradeLabel;
              } else {
                  if (theory > exam.maxTheory) throw new BadRequestException(`Theory marks cannot exceed ${exam.maxTheory}`);
                  if (practical > exam.maxPractical) throw new BadRequestException(`Practical marks cannot exceed ${exam.maxPractical}`);
              }

              let total = theory + practical;
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
                    theoryMarks: theory,
                    practicalMarks: practical,
                    totalMarks: total,
                    isAbsent: dto.isAbsent,
                    gradeLabel: gradeLabel,
                    remarks: dto.remarks,
                  },
                  create: {
                    examId: dto.examId,
                    studentId: dto.studentId,
                    subjectId: dto.subjectId,
                    theoryMarks: theory,
                    practicalMarks: practical,
                    totalMarks: total,
                    isAbsent: dto.isAbsent,
                    gradeLabel: gradeLabel,
                    remarks: dto.remarks,
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

  async getSubmissionStatus(examId: string) {
      const status = await this.prisma.markEntryStatus.findUnique({
          where: { examId },
          include: { exam: true }
      });
      return status || { status: 'DRAFT' };
  }

  async submitMarks(userId: string, examId: string) {
      const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
      if (!exam) throw new NotFoundException('Exam not found');

      return this.prisma.markEntryStatus.upsert({
          where: { examId },
          update: { status: 'PENDING_APPROVAL', submittedBy: userId },
          create: {
              examId,
              classId: exam.classId,
              subjectId: exam.subjectId,
              status: 'PENDING_APPROVAL',
              submittedBy: userId
          }
      });
  }

  async approveMarks(userId: string, examId: string) {
      const status = await this.prisma.markEntryStatus.findUnique({ where: { examId } });
      if (!status || status.status !== 'PENDING_APPROVAL') {
          throw new BadRequestException('Marks not pending approval');
      }
      return this.prisma.markEntryStatus.update({
          where: { examId },
          data: { status: 'APPROVED' }
      });
  }
}
