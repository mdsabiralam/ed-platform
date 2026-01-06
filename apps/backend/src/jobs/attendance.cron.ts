import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceCronService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateMonthlyAttendancePercentage() {
    console.log('Running nightly attendance percentage update...');
    // Logic to calculate and update attendance percentage
    // 1. Fetch all students
    // 2. For each student, calculate % for current month
    // 3. Update `student_summaries` table (Assuming it exists or needs to be created)

    // Example (Simplified):
    const students = await this.prisma.student.findMany();
    for (const student of students) {
       // Calculation logic here...
       console.log(`Updated summary for student ${student.id}`);
    }
  }
}
