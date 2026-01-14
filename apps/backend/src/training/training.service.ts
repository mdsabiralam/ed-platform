import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { TrainingAttendanceStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async getAttendanceDetails(attendanceId: string, userId: string) {
    const attendance = await this.prisma.trainingAttendance.findUnique({
      where: { id: attendanceId },
      include: {
        staff: true,
        training: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (attendance.staff.userId !== userId) {
      throw new ForbiddenException('Access Denied: You cannot view this attendance record');
    }

    return attendance;
  }

  async getAbsenteeismAnalytics(schoolId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const attendances = await this.prisma.trainingAttendance.findMany({
      where: {
        training: {
          tenantId: schoolId,
          date: {
            gte: sixMonthsAgo,
          },
        },
      },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
      },
    });

    const staffStats = new Map<string, { total: number; absent: number; staff: any }>();

    for (const record of attendances) {
      if (!staffStats.has(record.staffId)) {
        staffStats.set(record.staffId, { total: 0, absent: 0, staff: record.staff });
      }
      const stats = staffStats.get(record.staffId)!;
      stats.total++;
      if (record.status === TrainingAttendanceStatus.ABSENT) {
        stats.absent++;
      }
    }

    const report = [];
    for (const [staffId, stats] of staffStats.entries()) {
      const absenteeismRate = stats.total > 0 ? stats.absent / stats.total : 0;
      if (absenteeismRate > 0.5) {
        report.push({
          staffId,
          name: `${stats.staff.user.firstName} ${stats.staff.user.lastName}`,
          totalScheduled: stats.total,
          totalAbsent: stats.absent,
          absenteeismRate: parseFloat(absenteeismRate.toFixed(2)),
        });
      }
    }

    return report;
  }

  async generateTrainingCertificate(attendanceId: string) {
    const attendance = await this.prisma.trainingAttendance.findUnique({
      where: { id: attendanceId },
      include: {
        training: true,
        staff: {
          include: { user: true },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (attendance.status !== TrainingAttendanceStatus.PRESENT) {
      throw new BadRequestException('Certificate can only be generated for PRESENT attendance');
    }

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw Content
    const fontSize = 30;
    page.drawText('Certificate of Completion', {
      x: 50,
      y: height - 100,
      size: fontSize,
      font,
      color: rgb(0, 0.53, 0.71),
    });

    page.drawText(`This is to certify that`, {
      x: 50,
      y: height - 150,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    const teacherName = `${attendance.staff.user.firstName || ''} ${attendance.staff.user.lastName || ''}`.trim() || 'Teacher';
    page.drawText(teacherName, {
      x: 50,
      y: height - 180,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`has successfully completed the training:`, {
      x: 50,
      y: height - 220,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(attendance.training.title, {
      x: 50,
      y: height - 250,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });

    const dateStr = attendance.training.date.toDateString();
    page.drawText(`Date: ${dateStr}`, {
      x: 50,
      y: height - 300,
      size: 14,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Save to disk
    const certDir = path.join(process.cwd(), 'uploads', 'certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const filename = `cert-${attendanceId}-${Date.now()}.pdf`;
    const filePath = path.join(certDir, filename);

    fs.writeFileSync(filePath, pdfBytes);

    const certificateUrl = `/uploads/certificates/${filename}`;

    return this.prisma.trainingAttendance.update({
      where: { id: attendanceId },
      data: { certificateUrl },
    });
  }

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
