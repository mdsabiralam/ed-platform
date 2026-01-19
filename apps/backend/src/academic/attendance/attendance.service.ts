import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkAttendanceDto } from './attendance.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async markBulk(dto: BulkAttendanceDto) {
    const results = [];

    // Using transaction for data integrity
    await this.prisma.$transaction(async (tx) => {
      for (const record of dto.records) {
        await tx.attendance.create({
          data: {
            studentId: record.studentId,
            date: new Date(record.date),
            status: record.status,
            remarks: record.remarks,
          },
        });

        if (record.status === 'ABSENT') {
           this.sendSmsNotification(record.studentId);
        }
        results.push({ ...record, saved: true });
      }
    });

    return { success: true, count: results.length };
  }

  private sendSmsNotification(studentId: string) {
    // In a real app, fetch parent phone from Student -> ParentStudentMapping -> Guardian -> User -> Phone
    // For this task:
    this.logger.log(`SMS Notification sent to parent of student ${studentId}: "Your child is absent today."`);
  }
}
