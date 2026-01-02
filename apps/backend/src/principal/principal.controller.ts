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

  @Get('weak-students')
  async getWeakStudents(
    @Query('classId') classId: string,
    @Query('examTermId') examTermId: string,
    @Query('passPercentage') passPercentage?: number,
  ) {
    return this.principalService.getWeakStudents(
      classId,
      examTermId,
      passPercentage ? Number(passPercentage) : undefined,
    );
  }
}
