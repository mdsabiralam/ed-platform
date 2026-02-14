import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DayOfWeek } from '@prisma/client';

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prisma: PrismaService) {}

  async triggerSubstitutionWorkflow(leaveApplicationId: string) {
    // 1. Fetch Leave
    const leave = await this.prisma.leaveApplication.findUnique({
      where: { id: leaveApplicationId },
    });

    if (!leave || leave.status !== 'APPROVED') {
      throw new NotFoundException('Leave application not found or not approved');
    }

    const { teacherId, startDate, endDate } = leave;

    // 2. Iterate dates and create demand
    const substitutions: any[] = [];
    const loopDate = new Date(startDate);
    while (loopDate <= endDate) {
      // Get DayOfWeek
      const dayIndex = loopDate.getDay(); // 0 = Sun
      const dayMap: Record<number, DayOfWeek> = {
        0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT'
      };
      const dayEnum = dayMap[dayIndex];

      // Fetch routine entries for this teacher on this day
      const entries = await this.prisma.routineEntry.findMany({
        where: {
          teacherId,
          dayOfWeek: dayEnum,
        },
      });

      for (const entry of entries) {
        // Create Substitution Request if not exists
        const existing = await this.prisma.routineSubstitution.findFirst({
          where: {
            routineEntryId: entry.id,
            date: loopDate,
          },
        });

        if (!existing) {
          const sub = await this.prisma.routineSubstitution.create({
            data: {
              routineEntryId: entry.id,
              originalTeacherId: teacherId,
              date: new Date(loopDate), // Copy date
              status: 'PENDING',
            },
          });
          substitutions.push(sub);
        }
      }

      loopDate.setDate(loopDate.getDate() + 1);
    }

    this.logger.log(`Created ${substitutions.length} substitution requests for Leave ${leaveApplicationId}`);
    return substitutions;
  }

  /**
   * Cancel a leave request and revoke associated substitutions.
   */
  async cancelLeave(teacherId: string, startDate: Date, endDate: Date) {
    // 1. Find future substitutions for this teacher in the range
    const substitutions = await this.prisma.routineSubstitution.findMany({
      where: {
        originalTeacherId: teacherId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['PENDING', 'ASSIGNED'] },
      },
      include: { substituteTeacher: true },
    });

    // 2. Delete/Cancel them
    // Using deleteMany for efficiency, but we need to notify first.
    // So we iterate.
    for (const sub of substitutions) {
      if (sub.substituteTeacherId && sub.substituteTeacher) {
        this.logger.log(
          `[PUSH] To ${sub.substituteTeacher.firstName}: Substitution duty for ${sub.date.toDateString()} cancelled.`,
        );
      }

      // Update status to CANCELLED (assuming we want history) or Delete
      // Prompt said "Delete them (or mark as CANCELLED)". I'll mark as CANCELLED.
      await this.prisma.routineSubstitution.update({
        where: { id: sub.id },
        data: { status: 'CANCELLED' },
      });
    }

    return { count: substitutions.length };
  }
}
