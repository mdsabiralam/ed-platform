import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async submitFeedback(data: SubmitFeedbackDto) {
    const attendance = await this.prisma.trainingAttendance.findUnique({
      where: { id: data.attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return this.prisma.trainingAttendance.update({
      where: { id: data.attendanceId },
      data: {
        feedbackScore: data.score,
        feedbackComments: data.comments,
      },
    });
  }

  async createTraining(data: CreateTrainingDto) {
    return this.prisma.teacherTraining.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        durationHours: data.durationHours,
        resourcePerson: data.resourcePerson,
        resourceUrls: data.resourceUrls || [],
        tenantId: data.schoolId,
      },
    });
  }

  async getUpcomingTrainings(schoolId: string) {
    return this.prisma.teacherTraining.findMany({
      where: {
        tenantId: schoolId,
        date: {
          gt: new Date(),
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
