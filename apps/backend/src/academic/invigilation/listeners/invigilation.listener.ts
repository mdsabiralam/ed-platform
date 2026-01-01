import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class InvigilationListener {
  private readonly logger = new Logger(InvigilationListener.name);

  @OnEvent('invigilation.assigned')
  handleInvigilationAssigned(payload: { staffId: string; message: string }) {
    // 1. Send Push Notification (Mock)
    this.logger.log(`[Notification] Sending Push to ${payload.staffId}: ${payload.message}`);

    // 2. Store in Notification History (Mock DB call)
    // await this.prisma.notification.create(...)
    this.logger.log(`[Notification] Saved to history for ${payload.staffId}`);
  }
}
