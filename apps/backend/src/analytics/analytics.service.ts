import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingAttendanceStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrainingImpact(trainingId: string) {
    const training = await this.prisma.teacherTraining.findUnique({
      where: { id: trainingId },
      include: {
        attendances: {
          where: { status: TrainingAttendanceStatus.PRESENT },
          include: {
            staff: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!training) {
      throw new NotFoundException('Training session not found');
    }

    const impactAnalysis = [];

    for (const attendance of training.attendances) {
      const staffId = attendance.staffId;
      const trainingDate = training.date;

      // Ratings BEFORE training
      const preTrainingObservations = await this.prisma.classObservation.findMany({
        where: {
          staffId,
          date: { lt: trainingDate },
        },
      });

      // Ratings AFTER training
      const postTrainingObservations = await this.prisma.classObservation.findMany({
        where: {
          staffId,
          date: { gt: trainingDate },
        },
      });

      const avgPre = preTrainingObservations.length > 0
        ? preTrainingObservations.reduce((sum, obs) => sum + obs.rating, 0) / preTrainingObservations.length
        : 0;

      const avgPost = postTrainingObservations.length > 0
        ? postTrainingObservations.reduce((sum, obs) => sum + obs.rating, 0) / postTrainingObservations.length
        : 0;

      const improvement = avgPost > avgPre;

      impactAnalysis.push({
        staffName: `${attendance.staff.user.firstName} ${attendance.staff.user.lastName}`,
        preTrainingRating: parseFloat(avgPre.toFixed(2)),
        postTrainingRating: parseFloat(avgPost.toFixed(2)),
        improvement,
      });
    }

    return impactAnalysis;
  }
}
