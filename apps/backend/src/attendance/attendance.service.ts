import { Injectable } from '@nestjs/common';

@Injectable()
export class AttendanceService {
  async getAggregateAttendance(studentId: string): Promise<number> {
    // Mock implementation as Division 5 is not fully integrated in this context
    // In a real scenario, this would query the Attendance table.
    // Returning 80% to simulate a passing student by default.
    return 80.0;
  }
}
