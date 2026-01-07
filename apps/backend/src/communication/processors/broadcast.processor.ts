import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationTemplateService } from '../services/notification-template.service';

@Processor('broadcast_queue')
export class BroadcastProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templateService: NotificationTemplateService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { campaignId, userId, message, channel } = job.data;

    try {
      // 1. Fetch User details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { student: { include: { feeLedger: true } } },
      });

      if (!user) {
          throw new Error('User not found');
      }

      // 2. Personalize Message
      const personalizedMessage = this.templateService.processTemplate(message, user);

      // 3. Send Message (Mock Vendor)
      await this.mockSend(channel, user, personalizedMessage);

      // 4. Log Success
      await this.prisma.broadcastLog.create({
        data: {
          campaignId,
          userId,
          status: 'DELIVERED',
          vendorResponse: 'Message accepted',
        },
      });

      // Update Campaign status if needed (check if all done) - skipped for simplicity

    } catch (error) {
       // Log Failure
       await this.prisma.broadcastLog.create({
        data: {
          campaignId,
          userId,
          status: 'FAILED',
          vendorResponse: error.message,
        },
      });
      throw error;
    }
  }

  private async mockSend(channel: string, user: any, message: string) {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 50));

    // Simulate random failure
    if (Math.random() < 0.05) { // 5% failure rate
        throw new Error('Vendor gateway timeout');
    }

    // In a real app, switch(channel) ... call SmsService, etc.
    console.log(`[${channel}] Sending to ${user.email || user.phone}: ${message}`);
  }
}
