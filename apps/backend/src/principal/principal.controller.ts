import { Controller, Get, Query } from '@nestjs/common';
import { PrincipalService } from './principal.service';

@Controller('api/principal/class')
export class PrincipalController {
  constructor(private readonly principalService: PrincipalService) {}

  @Get('performance')
  async getClassPerformance(
    @Query('classId') classId: string,
    @Query('examTermId') examTermId: string,
  ) {
    return this.principalService.getClassPerformance(classId, examTermId);
  }
}
