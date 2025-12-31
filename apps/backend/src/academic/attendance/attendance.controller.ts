import { Controller, Post, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';

@Controller('teacher/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('bulk')
  markBulk(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.markBulkAttendance(dto);
  }
}
