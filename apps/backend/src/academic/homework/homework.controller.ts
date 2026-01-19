import { Controller, Post, Body } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './homework.dto';

@Controller('academic/homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  async createHomework(@Body() dto: CreateHomeworkDto) {
    return this.homeworkService.createHomework(dto);
  }
}
