import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceMarkedEvent } from '../events/attendance-marked.event';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async bulkMarkAttendance(dto: BulkAttendanceDto) {
    const { date, routineEntryId, records } = dto;
    const dateObj = new Date(date);

    // Using a transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      const results: any[] = [];
      for (const record of records) {
        // Upsert to prevent duplicate entries for the same student in the same slot
        // If it exists, we update the status (or ignore, depending on requirement. Prompt implies preventing duplicates, upsert handles "correction" or ensuring strictly one record)
        // Prompt says "prevent duplicate entries", which usually means don't create another one. Upsert fits best as it updates if exists or creates if new.
        const attendance = await tx.attendanceRegister.upsert({
          where: {
            date_studentId_routineEntryId: {
              date: dateObj,
              studentId: record.studentId,
              routineEntryId: routineEntryId,
            },
          },
          update: {
            status: record.status,
            markedAt: new Date(),
          },
          create: {
            date: dateObj,
            studentId: record.studentId,
            routineEntryId: routineEntryId,
            status: record.status,
            markedAt: new Date(),
          },
        });

        // Emit event for post-processing (SMS, etc.)
        this.eventEmitter.emit(
          'attendance.marked',
          new AttendanceMarkedEvent(
            attendance.studentId,
            attendance.status,
            attendance.date,
            attendance.routineEntryId
          ),
        );

        results.push(attendance);
      }
      return results;
    });
  }
}
