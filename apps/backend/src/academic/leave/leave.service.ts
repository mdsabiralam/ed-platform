import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prisma: PrismaService) {}

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
