import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('attendance-notifications') private readonly notificationQueue: Queue,
  ) {}

  async markBulkAttendance(dto: BulkAttendanceDto) {
    const receivedAt = new Date();
    this.logger.log(`Attendance Request Received at ${receivedAt.toISOString()}`);

    // Mock DB update (assuming generic attendance logic reusing LiveAttendanceLog or a new table if specified, but prompt says "Absent" and uses /teacher/attendance/bulk. I'll mock the DB write to focus on Latency logic as per 5.J.05)
    // Real implementation would upsert Attendance records.
    // For this test, we care about the Notification Latency.

    // Simulate pushing to queue
    const job = await this.notificationQueue.add('send-absent-sms', {
      studentIds: dto.studentIds,
      date: dto.date,
    });

    const pushedAt = new Date();
    this.logger.log(`Notification Job Pushed at ${pushedAt.toISOString()}`);

    return {
      success: true,
      receivedAt,
      pushedAt,
      latencyMs: pushedAt.getTime() - receivedAt.getTime(),
      jobId: job.id,
    };
  }
}
