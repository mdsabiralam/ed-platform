import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignHomeworkDto, SubmitHomeworkDto, GradeHomeworkDto } from './dto/homework.dto';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(dto: AssignHomeworkDto) {
    return this.prisma.homework.create({
      data: {
        classId: dto.classId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async submit(dto: SubmitHomeworkDto) {
    // Check if homework exists
    const homework = await this.prisma.homework.findUnique({
      where: { id: dto.homeworkId },
    });
    if (!homework) throw new NotFoundException('Homework not found');

    return this.prisma.homeworkSubmission.create({
      data: {
        homeworkId: dto.homeworkId,
        studentId: dto.studentId,
        fileUrl: dto.fileUrl,
        status: 'SUBMITTED',
      },
    });
  }

  async grade(dto: GradeHomeworkDto) {
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: { id: dto.submissionId },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    return this.prisma.homeworkSubmission.update({
      where: { id: dto.submissionId },
      data: {
        grade: dto.grade,
        status: 'GRADED',
      },
    });
  }
}
