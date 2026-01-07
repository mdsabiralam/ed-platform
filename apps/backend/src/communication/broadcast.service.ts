import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq'; // Assuming usage
import { InjectQueue } from '@nestjs/bullmq'; // Assuming usage

@Injectable()
export class BroadcastService {
  constructor(
    // In a real implementation, BullMQ Queue is injected here
    // @InjectQueue('broadcast') private broadcastQueue: Queue
  ) {}

  // 8.I.05 Quiet Hours & 8.I.06 Emergency Override
  async sendNotification(message: string, isEmergency: boolean) {
    const now = new Date();
    const hours = now.getHours();

    let delay = 0;

    // Check Quiet Hours: 10 PM (22) to 6 AM (6)
    if (!isEmergency && (hours >= 22 || hours < 6)) {
       // Calculate delay until 6 AM
       const nextMorning = new Date(now);
       if (hours >= 22) {
         nextMorning.setDate(nextMorning.getDate() + 1);
       }
       nextMorning.setHours(6, 0, 0, 0);
       delay = nextMorning.getTime() - now.getTime();
       console.log(`Quiet hours active. Delaying message by ${delay}ms`);
    }

    // 8.I.06 Emergency Override logic handled by 'isEmergency' flag check above

    // Add to queue (simulated for now, would use this.broadcastQueue.add in prod)
    // await this.broadcastQueue.add('send-sms', { message }, { delay });

    console.log(`Message queued. Emergency: ${isEmergency}, Delay: ${delay}`);
    return { status: 'queued', delay, isEmergency };
  }
}
