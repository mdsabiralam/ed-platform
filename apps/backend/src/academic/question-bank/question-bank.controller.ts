import { Controller, Post, Get, Body, Query, ParseArrayPipe, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
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
  @ApiOperation({ summary: 'Bulk import questions (JSON)' })
  @ApiBody({ type: [CreateQuestionDto] })
  @ApiResponse({ status: 201, description: 'Questions imported successfully.' })
  async importQuestions(
    @Body(new ParseArrayPipe({ items: CreateQuestionDto }))
    questions: CreateQuestionDto[],
  ) {
    return this.questionBankService.importQuestions(questions);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import questions from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importQuestionsFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Map and Validate raw data to DTOs
    // Ideally use class-validator on parsed data, but simple mapping for now
    const questions: CreateQuestionDto[] = jsonData.map((row: any) => ({
      subjectId: row.subjectId,
      topicTag: row.topicTag,
      type: row.type,
      difficulty: row.difficulty,
      marks: row.marks ? Number(row.marks) : 0,
      content: row.content,
      imageUrl: row.imageUrl,
      bloomsLevel: row.bloomsLevel,
      options: row.options ? (typeof row.options === 'string' ? JSON.parse(row.options) : row.options) : undefined,
      correctAnswer: row.correctAnswer,
    }));

    return this.questionBankService.importQuestions(questions);
  }

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    // In a real app, this would be a cloud URL or a publicly served static URL.
    // For local dev without static serving configured, we return a relative path or absolute path.
    // Assuming backend serves 'uploads' at /uploads
    return { imageUrl: `/uploads/${filename}` };
  }
}
