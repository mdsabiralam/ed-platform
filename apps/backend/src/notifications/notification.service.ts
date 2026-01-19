import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendBulkNotification(studentIds: string[], message: string, sender: string) {
    this.logger.log(`Sending notification to ${studentIds.length} students from ${sender}: ${message}`);
    return { success: true, sentCount: studentIds.length };
  }
}