import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VideoConferenceService } from './services/video-conference.service';
import { AcademicService } from './academic.service';
import { TenantMiddleware } from '../common/middleware/tenant.middleware';
import { Request } from 'express';
import { Req } from '@nestjs/common';

@Controller('academic/live')
export class AcademicController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly videoService: VideoConferenceService,
    private readonly academicService: AcademicService,
  ) {}

  @Post('log-attendance')
  async logAttendance(
    @Req() req: any,
    @Body('routineId') routineId: string,
    @Body('action') action: 'JOIN' | 'LEAVE',
    @Body('studentId') studentId: string, // Simulated Auth
  ) {
    if (!routineId || !action || !studentId) {
      throw new BadRequestException('routineId, action, and studentId are required');
    }
    const tenantId = req['tenantId'];
    return this.academicService.logAttendance(tenantId, studentId, routineId, action);
  }

  @Post('start')
  async startClass(
    @Body('routineId') routineId: string,
    // @Body('teacherId') teacherId: string, // In real app, extract from JWT
  ) {
    if (!routineId) {
      throw new BadRequestException('Routine ID is required');
    }

    // 1. Fetch Routine
    const routine = await this.prisma.routineEntry.findUnique({
      where: { id: routineId },
    });

    if (!routine) {
      throw new BadRequestException('Routine not found');
    }

    // 2. Verify Teacher (Skipped for simplicity as requested, but logic placeholder here)
    // if (routine.teacherId !== teacherId) throw new ForbiddenException();

    // 3. Generate Link
    const meetingLink = this.videoService.generateJitsiLink(routineId);

    // 4. Update DB
    await this.prisma.routineEntry.update({
      where: { id: routineId },
      data: {
        isLive: true,
        meetingLink: meetingLink,
      },
    });

    // 5. Trigger Push Notification (Mock)
    this.sendPushNotification(routine.classId, routine.subjectId);

    return {
      success: true,
      message: 'Class started successfully',
      meetingLink,
    };
  }

  private sendPushNotification(classId: string, subjectId: string) {
    console.log(`[PUSH] Class ${classId}, Subject ${subjectId}: Class has started! Join now.`);
  }
}
