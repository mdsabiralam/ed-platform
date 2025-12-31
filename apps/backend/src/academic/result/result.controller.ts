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
}
