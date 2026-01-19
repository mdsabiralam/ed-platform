import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  async submitHomework(homeworkId: string) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
    });

    if (!homework) throw new NotFoundException('Homework not found');

    const now = new Date();

    // Update homework status
    const updatedHomework = await this.prisma.homework.update({
      where: { id: homeworkId },
      data: { status: 'SUBMITTED', submittedAt: now },
    });

    // Increment badge count only if submitted on time
    if (now <= homework.dueDate) {
      await this.prisma.student.update({
        where: { id: homework.studentId },
        data: { badgeCount: { increment: 1 } },
      });
    }

    return updatedHomework;
  }
}
