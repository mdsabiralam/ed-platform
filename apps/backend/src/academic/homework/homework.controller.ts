import { Controller, Post, Param } from '@nestjs/common';
import { HomeworkService } from './homework.service';

@Controller('api/academic/homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post(':id/submit')
  async submitHomework(@Param('id') id: string) {
    return this.homeworkService.submitHomework(id);
  }
}
