import { Controller, Get, Param, Headers, NotFoundException, BadRequestException } from '@nestjs/common';
import { GradingService } from '../services/grading.service';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';

@ApiTags('Academic - Grading')
@Controller('api/academic/grades')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Get(':classId/:subjectId')
  @ApiOperation({ summary: 'Get grading rubric for a subject' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async getGradingRubric(
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
       throw new BadRequestException('Tenant ID is required in headers (x-tenant-id)');
    }

    const scale = await this.gradingService.getGradingScaleForSubject(tenantId, subjectId, classId);

    if (!scale) {
      throw new NotFoundException('No grading scale found for this subject.');
    }

    return scale;
  }
}
