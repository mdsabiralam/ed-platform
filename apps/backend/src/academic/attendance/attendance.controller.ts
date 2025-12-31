import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';

@ApiTags('Academic - Attendance')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID', required: true })
@Controller('teacher/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @ApiOperation({ summary: 'Mark bulk attendance' })
  @Post('bulk')
  markBulk(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.markBulkAttendance(dto);
  }
}
