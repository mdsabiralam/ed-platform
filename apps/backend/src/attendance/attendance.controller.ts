import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('attendance')
@Controller('api/teacher/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('bulk')
  @ApiOperation({ summary: 'Mark attendance for a whole class' })
  async bulkMarkAttendance(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.bulkMarkAttendance(dto);
  }
}
