import { Controller, Post, Get, Body, Query, Res, Req, BadRequestException } from '@nestjs/common';
import { ExamScheduleService } from './exam-schedule.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Academic - Exam Schedule')
@Controller('academic/exam/schedule')
export class ExamScheduleController {
  constructor(private readonly scheduleService: ExamScheduleService) {}

  @ApiOperation({ summary: 'Assign invigilator to exam' })
  @Post('invigilator')
  async assignInvigilator(@Body() body: { scheduleId: string; staffId: string; roomId: string }) {
    return this.scheduleService.assignInvigilator(body.scheduleId, body.staffId, body.roomId);
  }

  @ApiOperation({ summary: 'Generate Room Allocation Chart PDF' })
  @Get('allocation/pdf')
  async getRoomAllocation(@Req() req: any, @Query('date') dateString: string, @Res() res: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new BadRequestException('Tenant ID missing');

    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new BadRequestException('Invalid date format');

    const pdfBuffer = await this.scheduleService.generateRoomAllocationPdf(tenantId, date);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=room-allocation.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}
