import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { TrainingAttendanceStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadResource(trainingId: string, file: Express.Multer.File) {
    const training = await this.prisma.teacherTraining.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw new NotFoundException('Training session not found');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'training');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Security Fix: Use random ID instead of original filename to prevent directory traversal
    const fileExt = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExt}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    // In a real scenario, this would be a CDN or public URL
    const fileUrl = `/uploads/training/${filename}`;

    return this.prisma.teacherTraining.update({
      where: { id: trainingId },
      data: {
        resourceUrls: {
          push: fileUrl,
        },
      },
    });
  }

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
      // Check if entry already exists to avoid duplicates
      const existingEntry = await this.prisma.serviceBook.findFirst({
        where: {
          staffId: attendance.staffId,
          date: attendance.training.date,
          entryType: 'Professional Development',
          description: `Attended Training: ${attendance.training.title}`,
        },
      });

      if (!existingEntry) {
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
