import { Controller, Post, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto } from './attendance.dto';

@Controller('academic/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('bulk')
  async markBulk(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.markBulk(dto);
  }
}
