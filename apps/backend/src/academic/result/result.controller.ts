import { Controller, Get, Param, Req, BadRequestException } from '@nestjs/common';
import { ResultService } from './result.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Academic - Result')
@Controller('academic/result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @ApiOperation({ summary: 'Get grading rubric for a subject' })
  @Get('grades/:classId/:subjectId')
  async getRubric(@Req() req: any, @Param('subjectId') subjectId: string) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new BadRequestException('Tenant ID missing');
    return this.resultService.getRubric(subjectId, tenantId);
  }

  @ApiOperation({ summary: 'Process results for a term' })
  @ApiResponse({ status: 202, description: 'Result processing started.' })
  @Post('process')
  async processResults(@Body() body: { examTermId: string; classId: string }) {
      // 6.E.05: Skeleton for Result Processing
      // Ideally pushes to BullMQ
      return { message: 'Result processing job accepted', jobId: 'mock-job-id' };
  }
}
