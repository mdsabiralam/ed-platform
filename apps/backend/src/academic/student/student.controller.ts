import { Controller, Post, Body, Param } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateRemarkDto } from './student.dto';

@Controller('academic/student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post(':id/remark')
  async addRemark(@Param('id') id: string, @Body() dto: CreateRemarkDto) {
    return this.studentService.addRemark(id, dto);
  }
}
