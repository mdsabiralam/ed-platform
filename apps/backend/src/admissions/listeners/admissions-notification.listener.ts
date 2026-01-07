import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AdmissionStatusChangedEvent } from '../events/admission-status-changed.event';

@Injectable()
export class AdmissionsNotificationListener {
  private readonly logger = new Logger(AdmissionsNotificationListener.name);

  @OnEvent('admission.status.changed')
  async handleAdmissionStatusChangedEvent(event: AdmissionStatusChangedEvent) {
    this.logger.log(
      `[Notification] Application ${event.applicationId} status changed from ${event.oldStatus} to ${event.newStatus}. Triggering Email/SMS...`,
    );

    // Here we would inject NotificationService (Email/SMS) and send the actual message.
    // For now, we just log it as per requirements for "listener/observer".

    // Example logic:
    // if (event.newStatus === 'REJECTED') {
    //   await this.emailService.sendRejectionEmail(event.application.email, event.application.remarks);
    // }
  }
}
