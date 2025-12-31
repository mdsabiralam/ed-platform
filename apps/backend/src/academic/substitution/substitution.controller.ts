import { Controller, Post, Body, Get, Req, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { SubstitutionService } from './substitution.service';
import { AssignSubstituteDto } from './dto/assign-substitute.dto';

@ApiTags('Academic - Substitution')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID', required: true })
@Controller('academic/substitution')
export class SubstitutionController {
  constructor(private readonly substitutionService: SubstitutionService) {}

  @ApiOperation({ summary: 'Get pending substitutions' })
  @Get('pending')
  getPendingSubstitutions(@Req() req: any) {
    const tenantId = req['tenantId'];
    return this.substitutionService.findPending(tenantId);
  }

  @ApiOperation({ summary: 'Find available teachers for substitution' })
  @Get('available')
  getAvailableTeachers(
    @Query('slotId') slotId: string,
    @Query('date') date: string,
    @Query('day') day: string,
  ) {
    return this.substitutionService.findAvailableTeachers(slotId, new Date(date), day);
  }

  @ApiOperation({ summary: 'Assign a substitute teacher' })
  @Post('assign')
  assignSubstitute(@Body() dto: AssignSubstituteDto) {
    return this.substitutionService.assignSubstitute(dto);
  }

  @ApiOperation({ summary: 'Process payroll for completed substitutions (Cron)' })
  @Post('process-payroll')
  async processPayroll() {
    return this.substitutionService.markCompletedAndLogPayroll();
  }
}
