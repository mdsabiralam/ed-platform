import { Controller, Post, Body } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { AssignHomeworkDto, SubmitHomeworkDto, GradeHomeworkDto } from './dto/homework.dto';

@Controller('academic/homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post('assign')
  assign(@Body() dto: AssignHomeworkDto) {
    return this.homeworkService.assign(dto);
  }

  @Post('submit')
  submit(@Body() dto: SubmitHomeworkDto) {
    return this.homeworkService.submit(dto);
  }

  @Post('grade')
  grade(@Body() dto: GradeHomeworkDto) {
    return this.homeworkService.grade(dto);
  }
}
