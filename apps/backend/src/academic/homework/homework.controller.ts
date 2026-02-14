import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { HomeworkService } from './homework.service';
import { AssignHomeworkDto, SubmitHomeworkDto, GradeHomeworkDto } from './dto/homework.dto';

@ApiTags('Academic - Homework')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID', required: true })
@Controller('academic/homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @ApiOperation({ summary: 'Assign homework' })
  @Post('assign')
  assign(@Body() dto: AssignHomeworkDto) {
    return this.homeworkService.assign(dto);
  }

  @ApiOperation({ summary: 'Submit homework' })
  @Post('submit')
  submit(@Body() dto: SubmitHomeworkDto) {
    return this.homeworkService.submit(dto);
  }

  @ApiOperation({ summary: 'Grade homework' })
  @Post('grade')
  grade(@Body() dto: GradeHomeworkDto) {
    return this.homeworkService.grade(dto);
  }
}
