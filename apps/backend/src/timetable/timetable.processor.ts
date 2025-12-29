import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('timetable-generation')
export class TimetableProcessor extends WorkerHost {
  private readonly logger = new Logger(TimetableProcessor.name);

  async process(job: Job): Promise<any> {
    this.logger.log(`Starting job ${job.id}`);

    // Simulate complex processing time
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Return MOCK data structure with resolved names for the frontend
    // This matches the structure the mobile app should expect
    const mockRoutine = [
      {
        day: 'MON',
        startTime: '09:00',
        endTime: '10:00',
        subject: 'Mathematics',
        teacher: 'Mr. Smith',
        room: 'Room 101',
      },
      {
        day: 'MON',
        startTime: '10:00',
        endTime: '11:00',
        subject: 'Physics',
        teacher: 'Ms. Johnson',
        room: 'Lab 1',
      },
      {
        day: 'TUE',
        startTime: '09:00',
        endTime: '10:00',
        subject: 'English',
        teacher: 'Mrs. Davis',
        room: 'Room 102',
      },
       {
        day: 'TUE',
        startTime: '10:00',
        endTime: '11:00',
        subject: 'Chemistry',
        teacher: 'Mr. Brown',
        room: 'Lab 2',
      },
    ];

    this.logger.log(`Job completed ${job.id}`);
    return mockRoutine;
  }
}
