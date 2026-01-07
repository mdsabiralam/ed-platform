import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('academic/student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('sample')
  async getSample(@Query('classId') classId: string) {
    return this.studentService.getRandomSample(classId);
  }
}
