import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
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

  @Post('assign')
  assignSubstitute(@Body() dto: AssignSubstituteDto) {
    return this.substitutionService.assignSubstitute(dto);
  }
}
