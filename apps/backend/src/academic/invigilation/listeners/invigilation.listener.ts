import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InvigilationListener {
  private readonly logger = new Logger(InvigilationListener.name);

  constructor(private prisma: PrismaService) {}

  @OnEvent('invigilation.assigned')
  async handleInvigilationAssigned(payload: { staffId: string; message: string }) {
    // 1. Send Push Notification (Mock)
    this.logger.log(`[Notification] Sending Push to ${payload.staffId}: ${payload.message}`);

    // 2. Store in Notification History
    try {
        // Need to resolve userId from staffId
        const staff = await this.prisma.staffProfile.findUnique({
            where: { id: payload.staffId },
            select: { userId: true },
        });

        if (staff) {
            await this.prisma.notification.create({
                data: {
                    userId: staff.userId,
                    title: 'Exam Duty Assigned',
                    message: payload.message,
                    type: 'EXAM_DUTY',
                },
            });
            this.logger.log(`[Notification] Saved to history for staff ${payload.staffId} (User: ${staff.userId})`);
        } else {
             this.logger.warn(`[Notification] Staff profile not found for ID ${payload.staffId}`);
        }
    } catch (e) {
        this.logger.error(`[Notification] Failed to save notification: ${e.message}`, e.stack);
    }
  }
}
