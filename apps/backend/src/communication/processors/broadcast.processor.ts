import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationTemplateService } from '../services/notification-template.service';

@Processor('broadcast_queue', { limiter: { max: 50, duration: 1000 } })
export class BroadcastProcessor extends WorkerHost {
  constructor(
      private prisma: PrismaService,
      private templateService: NotificationTemplateService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { campaignId, userId, message, channel } = job.data;

    // Fetch user with details for variable replacement
    const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
            student: true,
            staffProfile: true
        }
    });

    if (!user) return; // Should handle error appropriately

    // Prepare context for template service (flattening or using dot notation in service)
    const userContext = {
        ...user,
        student: user.student,
        // convenience fields
        firstName: user.student?.firstName || user.staffProfile?.userId || '',
        lastName: user.student?.lastName || '',
        // add more as needed
    };

    const finalMessage = this.templateService.replaceVariables(message, userContext);

    // Mock Send Logic
    let vendorResponse = 'Mock Success';
    let status = 'DELIVERED';

    try {
        // Here we would call SmsService, EmailService etc.
        // For now, we simulate success.
        // if (channel === 'SMS') await smsService.send(user.phone, finalMessage);

        // Simulating some failure for robustness testing if needed, or just log.
        // console.log(`[${channel}] Sending to ${user.email || user.phone}: ${finalMessage}`);

    } catch (e) {
        status = 'FAILED';
        vendorResponse = e instanceof Error ? e.message : 'Unknown Error';
    }

    // Create Log
    await this.prisma.broadcastLog.create({
        data: {
            campaignId,
            userId,
            status,
            vendorResponse
        }
    });

    return { status, userId };
  }
}
