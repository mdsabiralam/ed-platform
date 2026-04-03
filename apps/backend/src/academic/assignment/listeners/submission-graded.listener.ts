import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../../../notification/notification.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SubmissionGradedListener {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('submission.graded')
  async handleSubmissionGradedEvent(payload: { submissionId: string }) {
    console.log(`[SubmissionGradedListener] Received event for submission ${payload.submissionId}`);

    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: payload.submissionId },
      include: {
        assignment: true,
        student: {
          include: {
            guardians: {
              include: {
                guardian: {
                  include: { user: true }
                }
              }
            }
          }
        }
      },
    });

    if (!submission || !submission.student) return;

    // Logic to notify parent(s)
    const guardians = submission.student.guardians;
    for (const mapping of guardians) {
      const guardianUser = mapping.guardian.user;
      if (guardianUser) {
        await this.notificationService.sendPush(
          guardianUser.id,
          'Feedback Received',
          `Feedback received on ${submission.assignment.title} Homework.`,
        );
      }
    }
  }
}
