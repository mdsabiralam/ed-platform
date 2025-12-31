import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  /**
   * Checks if an exam schedule conflicts with existing schedules for a specific class.
   *
   * @param classId The ID of the class.
   * @param date The date of the exam.
   * @param startTime The start time of the exam.
   * @param durationMinutes The duration of the exam in minutes.
   * @throws ConflictException if an overlap is found.
   */
  async checkScheduleConflict(
    classId: string,
    date: Date,
    startTime: Date,
    durationMinutes: number,
  ): Promise<void> {
    const newExamStart = new Date(startTime);
    const newExamEnd = new Date(newExamStart.getTime() + durationMinutes * 60000);

    // Fetch all exams for this class on the same date
    // We assume 'date' field in DB represents the day.
    // To be safe, we can filter by range or just match the date part if it's stored as midnight.
    // Assuming `date` in DB is stored as DateTime at 00:00:00 or similar for the day.

    // To robustly handle "same day", we can use a range for the `date` field
    // or assume the input `date` matches the stored `date` format (e.g. truncated to day).
    // Let's assume strict equality on the `date` field for now as per schema design implies it holds the "Date" of the exam.

    const potentialConflicts = await this.prisma.examSchedule.findMany({
      where: {
        classId: classId,
        date: date,
      },
    });

    for (const schedule of potentialConflicts) {
      const existingStart = new Date(schedule.startTime);
      const existingEnd = new Date(existingStart.getTime() + schedule.durationMinutes * 60000);

      // Check for overlap
      // Overlap exists if (StartA < EndB) and (EndA > StartB)
      if (newExamStart < existingEnd && newExamEnd > existingStart) {
        throw new ConflictException('Class already has an exam scheduled at this time');
      }
    }
  }
}
