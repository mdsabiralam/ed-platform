import { Controller, Post, Put, Body, Param, Headers, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ResultService } from '../services/result.service';

@ApiTags('Academic - Result')
@Controller('api/academic/result')
export class ResultController {
  constructor(
    @InjectQueue('result-calculation') private resultQueue: any,
    private resultService: ResultService
  ) {}

  @Put(':id/release')
  @ApiOperation({ summary: 'Release withheld result' })
  async releaseResult(@Param('id') id: string) {
      return this.resultService.releaseResult(id);
  }

  @Post('process')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger result calculation' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async processResult(
    @Body() body: { examTermId: string; classId?: string },
    @Headers('x-tenant-id') tenantId: string
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');

    const job = await this.resultQueue.add('process-term-results', {
        examTermId: body.examTermId,
        classId: body.classId,
        tenantId
    });

    return { jobId: job.id, message: 'Calculation started' };
  }
}
