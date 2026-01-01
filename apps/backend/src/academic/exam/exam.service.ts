import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
 import { RescheduleExamDto } from './dto/reschedule-exam.dto';
 import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ExamService {
   constructor(
     private prisma: PrismaService,
     private eventEmitter: EventEmitter2, // Add EventEmitter
   ) {}

  async getSchedules(classId: string) {
    return this.prisma.examSchedule.findMany({
      where: { classId },
      include: {
        subject: true,
        exam: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async createSchedules(schedules: CreateExamScheduleDto[]) {
    return await this.prisma.$transaction(async (tx) => {
      const createdSchedules = [];
      for (const schedule of schedules) {
        // Construct Date objects
        // date string to Date
        const dateObj = new Date(schedule.date);

        // time string to Date (Start Time)
        // If 'time' is full ISO, use it. If HH:mm, merge with date.
        // Assuming 'time' is full ISO or we parse it.
        // Let's assume input 'time' is a full ISO string for the start time.
        const startTimeObj = new Date(schedule.time);

        // Conflict check
        // Note: We use 'tx' (transaction client) for saving, but for checking conflict
        // we should also use 'tx' to see conflicts within the current transaction?
        // OR use `this.checkScheduleConflict` which uses `this.prisma`.
        // Ideally we should refactor checkScheduleConflict to accept a prisma client instance,
        // or just perform check here.
        // Given we need to reuse logic, I'll inline the check or call the method.
        // But the method uses `this.prisma` (global). If we are in a transaction and inserting multiple,
        // subsequent checks in the loop won't see previous insertions in the same transaction
        // unless we use `tx`.
        // `findFirst` on `tx` sees uncommitted writes within the transaction.
        // So I should verify conflict against DB *and* against the list I'm currently building if needed?
        // Actually, `tx.examSchedule.findMany` will see records created in previous iterations of this loop.

        // So I'll replicate the conflict logic using `tx`.

        // 1. Check DB conflicts (including those just added in this transaction)
        await this.checkScheduleConflictWithClient(tx, schedule.classId, dateObj, startTimeObj, schedule.duration);

        // 2. Create
        const newSchedule = await tx.examSchedule.create({
          data: {
            examId: schedule.examId,
            subjectId: schedule.subjectId,
            classId: schedule.classId,
            date: dateObj,
            startTime: startTimeObj,
            durationMinutes: schedule.duration,
          },
        });
        createdSchedules.push(newSchedule);
      }
      return createdSchedules;
    });
  }

  async rescheduleExam(id: string, dto: RescheduleExamDto) {
    const examSchedule = await this.prisma.examSchedule.findUnique({
      where: { id },
      include: { subject: true },
    });

    if (!examSchedule) {
      throw new ConflictException('Exam schedule not found');
    }

    const dateObj = new Date(dto.date);
    const startTimeObj = new Date(dto.time);

    // 1. Verify no conflicts with the new time (exclude current exam ID)
    await this.checkScheduleConflict(
      examSchedule.classId,
      dateObj,
      startTimeObj,
      dto.duration,
      id, // Exclude this exam
    );

    // 2. Update the record
    const updatedSchedule = await this.prisma.examSchedule.update({
      where: { id },
      data: {
        date: dateObj,
        startTime: startTimeObj,
        durationMinutes: dto.duration,
      },
    });

    // 3. Trigger Urgent Alert
    this.eventEmitter.emit('exam.rescheduled', {
      classId: examSchedule.classId,
      subjectName: examSchedule.subject.name,
      newDate: dateObj,
      newTime: startTimeObj,
    });

    return updatedSchedule;
  }

  /**
   * Helper to check conflict using a specific prisma client (tx or this.prisma).
   */
  private async checkScheduleConflictWithClient(
    prismaClient: any,
    classId: string,
    date: Date,
    startTime: Date,
    durationMinutes: number,
    excludeExamId?: string,
  ): Promise<void> {
    const newExamStart = new Date(startTime);
    const newExamEnd = new Date(newExamStart.getTime() + durationMinutes * 60000);

    const potentialConflicts = await prismaClient.examSchedule.findMany({
      where: {
        classId: classId,
        date: date,
        // Exclude the current exam if ID provided
        ...(excludeExamId ? { id: { not: excludeExamId } } : {}),
      },
    });

    for (const schedule of potentialConflicts) {
      const existingStart = new Date(schedule.startTime);
      const existingEnd = new Date(existingStart.getTime() + schedule.durationMinutes * 60000);

      if (newExamStart < existingEnd && newExamEnd > existingStart) {
        throw new ConflictException('Class already has an exam scheduled at this time');
      }
    }
  }

  /**
   * Checks if an exam schedule conflicts with existing schedules for a specific class.
   *
   * @param classId The ID of the class.
   * @param date The date of the exam.
   * @param startTime The start time of the exam.
   * @param durationMinutes The duration of the exam in minutes.
   * @param excludeExamId Optional ID of exam to exclude from check (for updates).
   * @throws ConflictException if an overlap is found.
   */
  async checkScheduleConflict(
    classId: string,
    date: Date,
    startTime: Date,
    durationMinutes: number,
    excludeExamId?: string,
  ): Promise<void> {
    return this.checkScheduleConflictWithClient(this.prisma, classId, date, startTime, durationMinutes, excludeExamId);
  }
}
