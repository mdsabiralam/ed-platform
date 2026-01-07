import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DataRetentionService {
  constructor(private prisma: PrismaService) {}

  // 8.I.07 Data Retention Policy (Auto-Cleanup)
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupChatAttachments() {
    console.log('Running chat attachment cleanup...');
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Find messages with attachments older than 1 year
    const oldMessages = await this.prisma.chatMessage.findMany({
      where: {
        createdAt: { lt: oneYearAgo },
        attachmentUrl: { not: null }
      }
    });

    for (const msg of oldMessages) {
       // Mock S3 deletion
       // await s3.deleteObject(...)
       console.log(`Deleting attachment for message ${msg.id}`);

       // Update record
       await this.prisma.chatMessage.update({
         where: { id: msg.id },
         data: {
           attachmentUrl: null,
           content: msg.content + ' [Attachment Expired/Deleted]'
         }
       });
    }
  }
}
