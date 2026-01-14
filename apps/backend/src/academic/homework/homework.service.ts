import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  async assignHomework(tenantId: string, data: any) {
    return this.prisma.homework.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
      },
    });
  }

  async submitHomework(studentId: string, homeworkId: string, submissionUrl: string) {
    const homework = await this.prisma.homework.findUnique({ where: { id: homeworkId } });
    if (!homework) throw new NotFoundException('Homework not found');

    return this.prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId,
        },
      },
      update: {
        submissionUrl,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      create: {
        homeworkId,
        studentId,
        submissionUrl,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }

  async gradeHomework(homeworkId: string, studentId: string, grade: string, feedback?: string) {
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId,
        },
      },
    });

    if (!submission) throw new NotFoundException('Submission not found');

    return this.prisma.homeworkSubmission.update({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId,
        },
      },
      data: {
        status: 'GRADED',
        grade,
        feedback,
      },
    });
  }
}
