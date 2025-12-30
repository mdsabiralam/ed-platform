import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prisma: PrismaService) {}

  async triggerSubstitutionWorkflow(leaveApplicationId: string) {
    const leaveApplication = await this.prisma.leaveApplication.findUnique({
      where: { id: leaveApplicationId },
      include: { applicant: true },
    });

    if (!leaveApplication) {
      throw new Error('Leave application not found');
    }

    if (leaveApplication.status !== 'APPROVED') {
      this.logger.warn(`Leave application ${leaveApplicationId} is not APPROVED. Workflow skipped.`);
      return;
    }

    const { applicantId, startDate, endDate } = leaveApplication;

    // Helper to get days of week from date range
    const getDaysInRange = (start: Date, end: Date) => {
      const days: { date: Date; dayName: string }[] = [];
      const current = new Date(start);
      const endDt = new Date(end);

      while (current <= endDt) {
        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        // Map to String format expected by RoutineEntry (assuming standard English names or UpperCase)
        // Adjust based on your DB values. Typically 'MONDAY', 'TUESDAY', etc.
        const dayOfWeekIndex = current.getDay();
        const daysMap = [
          'SUNDAY',
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ];
        days.push({
          date: new Date(current),
          dayName: daysMap[dayOfWeekIndex],
        });
        current.setDate(current.getDate() + 1);
      }
      return days;
    };

    const daysInRange = getDaysInRange(startDate, endDate);

    for (const { date, dayName } of daysInRange) {
      // Find routines for this teacher on this day
      // Note: RoutineEntry dayOfWeek casing needs to match DB. Assuming UPPERCASE.
      const routines = await this.prisma.routineEntry.findMany({
        where: {
          teacherId: applicantId,
          dayOfWeek: dayName,
        },
      });

      for (const routine of routines) {
        // Create Substitution
        // Check if substitution already exists to prevent duplicates (optional but safe)
        const existingSub = await this.prisma.routineSubstitution.findFirst({
          where: {
            routineEntryId: routine.id,
            date: date,
          },
        });

        if (!existingSub) {
          await this.prisma.routineSubstitution.create({
            data: {
              routineEntryId: routine.id,
              originalTeacherId: applicantId,
              date: date,
              status: 'PENDING',
            },
          });
        }
      }
    }
  }
}
