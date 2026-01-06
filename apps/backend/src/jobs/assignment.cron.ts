import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SubmissionStatus } from '@prisma/client';

@Injectable()
export class AssignmentCronService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoMarkMissingAssignments() {
    console.log('Running auto-mark missing assignments job...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    // 1. Find assignments due yesterday
    const assignments = await this.prisma.assignment.findMany({
        where: {
            dueDate: {
                lt: new Date(), // Due date passed
                gte: yesterday // Only process recent ones to avoid processing old ones repeatedly (or use a processed flag)
            }
        },
        include: { section: { include: { students: true } } }
    });

    for (const assignment of assignments) {
        for (const student of assignment.section.students) {
            // Check if submission exists
            const submission = await this.prisma.assignmentSubmission.findUnique({
                where: {
                    studentId_assignmentId: {
                        studentId: student.id,
                        assignmentId: assignment.id
                    }
                }
            });

            if (!submission) {
                // Mark as MISSING
                await this.prisma.assignmentSubmission.create({
                    data: {
                        studentId: student.id,
                        assignmentId: assignment.id,
                        status: SubmissionStatus.MISSING,
                        obtainedMarks: 0,
                        teacherFeedback: 'Auto-marked: Not Submitted',
                    }
                });
                console.log(`Marked missing: Student ${student.id} for Assignment ${assignment.id}`);
            }
        }
    }
  }
}
