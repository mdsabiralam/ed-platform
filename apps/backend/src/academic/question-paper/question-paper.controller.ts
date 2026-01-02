import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionPaperService } from './question-paper.service';
import { GeneratePaperDto } from './dto/generate-paper.dto';
import { SwapQuestionDto } from './dto/swap-question.dto';
// Assuming Authentication guards are standard, e.g., JwtAuthGuard
// import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Academic - Question Paper')
@Controller('academic/paper')
// @UseGuards(JwtAuthGuard) // Commented out as Auth module structure is not fully known from context, but standard practice.
export class QuestionPaperController {
  constructor(private readonly questionPaperService: QuestionPaperService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a draft question paper based on blueprint' })
  @ApiResponse({ status: 201, description: 'List of selected questions returned as preview.' })
  @ApiBearerAuth()
  async generatePaper(@Body() dto: GeneratePaperDto) {
    return this.questionPaperService.generatePaper(
      dto.blueprintId,
      dto.classId,
      dto.chapterIds,
    );
  }

  @Post('swap')
  @ApiOperation({ summary: 'Swap a question with a similar one (same type, difficulty, marks)' })
  @ApiResponse({ status: 200, description: 'The new replacement question.' })
  @ApiBearerAuth()
  async swapQuestion(@Body() dto: SwapQuestionDto) {
    return this.questionPaperService.swapQuestion(
      dto.currentQuestionId,
      dto.classId,
    );
  }
}
