import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('timetable-generation')
export class TimetableProcessor extends WorkerHost {
  private readonly logger = new Logger(TimetableProcessor.name);

  async process(job: Job): Promise<any> {
    this.logger.log(`Starting job ${job.id}`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    this.logger.log(`Job completed ${job.id}`);
  }
}
