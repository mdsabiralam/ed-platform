import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsScheduler {
  private readonly logger = new Logger(EventsScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  // এই ফাংশনটি প্রতিদিন সকাল ৮টায় রান করবে
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDutyReminders() {
    this.logger.log('Running daily duty reminder job...');

    // ১. আগামীকাল (আগামী ২৪ ঘণ্টার মধ্যে) যেসব ডিউটি আছে তা খুঁজে বের করা
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    const upcomingDuties = await this.prisma.eventDuty.findMany({
      where: {
        startTime: {
          gte: startOfTomorrow,
          lte: endOfTomorrow,
        },
        status: 'ASSIGNED',
      },
      include: {
        assignedTo: {
          include: {
            user: true, // ইউজারের ফোন নম্বর পাওয়ার জন্য
          },
        },
        event: true,
      },
    });

    // ২. প্রতিটি স্টাফকে নোটিফিকেশন পাঠানো (Placeholder Logic)
    for (const duty of upcomingDuties) {
      if (duty.assignedTo?.user?.phone) {
        const message = `
          🎫 Digital Duty Card
          Event: ${duty.event.name}
          Role: ${duty.roleDescription}
          Time: ${duty.startTime.toLocaleTimeString()} - ${duty.endTime.toLocaleTimeString()}
          Location: ${duty.event.location || 'Campus'}
        `;
        
        // এখানে আপনার SMS বা WhatsApp API ইন্টিগ্রেট করতে হবে
        // যেমন: await this.whatsappService.send(duty.assignedTo.user.phone, message);
        
        this.logger.log(`Sending Duty Card to ${duty.assignedTo.displayName} (${duty.assignedTo.user.phone})`);
      }
    }
  }
}