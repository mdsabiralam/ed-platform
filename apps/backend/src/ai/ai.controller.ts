import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('grade')
  async gradeAssignment(@Body() dto: GradeAssignmentDto) {
    return this.aiService.gradeAssignment(dto.imageUrl, dto.referenceAnswer);
  }
}
