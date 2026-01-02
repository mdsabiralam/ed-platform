import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { TrainingAttendanceStatus } from '@prisma/client';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(attendanceId: string, status: TrainingAttendanceStatus) {
    const attendance = await this.prisma.trainingAttendance.findUnique({
      where: { id: attendanceId },
      include: { training: true },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    const updatedAttendance = await this.prisma.trainingAttendance.update({
      where: { id: attendanceId },
      data: { status },
    });

    // 7.F.04: Integration with ServiceBook
    if (status === TrainingAttendanceStatus.PRESENT) {
      // Check if entry already exists to avoid duplicates (optional but good practice)
      // For now, we assume simple append log logic as per requirement
      await this.prisma.serviceBook.create({
        data: {
          staffId: attendance.staffId,
          tenantId: attendance.training.tenantId,
          entryType: 'Professional Development',
          description: `Attended Training: ${attendance.training.title}`,
          date: attendance.training.date,
          durationHours: attendance.training.durationHours,
        },
      });
    }

    return updatedAttendance;
  }

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
