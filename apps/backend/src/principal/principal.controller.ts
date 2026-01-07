import { Controller, Get, Query } from '@nestjs/common';
import { PrincipalService } from './principal.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Principal')
@Controller('api/principal')
export class PrincipalController {
  constructor(private readonly principalService: PrincipalService) {}

  @Get('class/performance')
  @ApiOperation({ summary: 'Get subject-wise average performance for a class' })
  @ApiQuery({ name: 'classId', required: true })
  @ApiQuery({ name: 'examTermId', required: true })
  async getClassPerformance(
    @Query('classId') classId: string,
    @Query('examTermId') examTermId: string,
  ) {
    return this.principalService.getClassPerformance(classId, examTermId);
  }

  @Get('class/weak-students')
  @ApiOperation({ summary: 'Get list of weak students failing in multiple subjects' })
  @ApiQuery({ name: 'classId', required: true })
  @ApiQuery({ name: 'examTermId', required: true })
  async getWeakStudents(
    @Query('classId') classId: string,
    @Query('examTermId') examTermId: string,
  ) {
    return this.principalService.getWeakStudents(classId, examTermId);
  }
}
