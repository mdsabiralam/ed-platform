import { Controller, Post, Get, Body, Query, ParseArrayPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionFilterDto } from './dto/question-filter.dto';

@ApiTags('Academic - Question Bank')
@Controller('academic/question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'The question has been successfully created.' })
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionBankService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter questions' })
  @ApiResponse({ status: 200, description: 'List of matching questions.' })
  async findAll(@Query() filters: QuestionFilterDto) {
    return this.questionBankService.findAll(filters);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import questions' })
  @ApiBody({ type: [CreateQuestionDto] })
  @ApiResponse({ status: 201, description: 'Questions imported successfully.' })
  async importQuestions(
    @Body(new ParseArrayPipe({ items: CreateQuestionDto }))
    questions: CreateQuestionDto[],
  ) {
    return this.questionBankService.importQuestions(questions);
  }
}
