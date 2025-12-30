import { Controller, Post, Body, Get, Req, UseGuards, Query } from '@nestjs/common';
import { SubstitutionService } from './substitution.service';
import { AssignSubstituteDto } from './dto/assign-substitute.dto';

@Controller('academic/substitution')
export class SubstitutionController {
  constructor(private readonly substitutionService: SubstitutionService) {}

  @Get('pending')
  getPendingSubstitutions(@Req() req: any) {
    const tenantId = req['tenantId'];
    return this.substitutionService.findPending(tenantId);
  }

  @Get('available')
  getAvailableTeachers(
    @Query('slotId') slotId: string,
    @Query('date') date: string,
    @Query('day') day: string,
  ) {
    return this.substitutionService.findAvailableTeachers(slotId, new Date(date), day);
  }

  @Post('assign')
  assignSubstitute(@Body() dto: AssignSubstituteDto) {
    return this.substitutionService.assignSubstitute(dto);
  }

  @Post('process-payroll')
  async processPayroll() {
    return this.substitutionService.markCompletedAndLogPayroll();
  }
}
