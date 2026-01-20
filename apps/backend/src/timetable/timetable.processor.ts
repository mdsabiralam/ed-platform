import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('timetable-generation')
export class TimetableProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`);
    // Add your job processing logic here
    return {};
  }
}
