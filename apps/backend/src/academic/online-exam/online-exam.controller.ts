import { Controller, Post, Body } from '@nestjs/common';
import { OnlineExamService } from './online-exam.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('academic/online-exam')
export class OnlineExamController {
  constructor(private readonly onlineExamService: OnlineExamService) {}

  @Post('submit')
  async submitQuiz(@Body() dto: SubmitQuizDto) {
    return this.onlineExamService.submitQuiz(dto.examId, dto.studentId, dto.answers);
  }
}
