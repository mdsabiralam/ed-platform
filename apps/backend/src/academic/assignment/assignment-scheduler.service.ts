import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssignmentSchedulerService {
  private readonly logger = new Logger(AssignmentSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutoCloseAssignments() {
    this.logger.log('Running auto-close assignment check...');

    const now = new Date();

    // Find assignments where due date has passed, late submission is NOT allowed, and NOT yet locked
    const assignmentsToLock = await this.prisma.assignment.findMany({
      where: {
        dueDate: { lt: now },
        allowLateSubmission: false,
        isLocked: false,
      },
    });

    if (assignmentsToLock.length === 0) {
        this.logger.log('No assignments to lock.');
        return;
    }

    this.logger.log(`Found ${assignmentsToLock.length} assignments to lock.`);

    // Bulk update to lock them
    // Note: Prisma updateMany returns BatchPayload { count: number }
    const updateResult = await this.prisma.assignment.updateMany({
      where: {
        id: { in: assignmentsToLock.map((a) => a.id) },
      },
      data: {
        isLocked: true,
      },
    });

    this.logger.log(`Locked ${updateResult.count} assignments.`);
  }
}
