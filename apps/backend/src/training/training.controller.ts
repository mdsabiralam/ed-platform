import { Controller, Post, Get, Body, Query, BadRequestException, Put, Param, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Express } from 'express';

@Controller('academic/training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResource(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: /pdf|ppt|pptx|mp4|avi|mkv/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.trainingService.uploadResource(id, file);
  }

  @Put('attendance/:id')
  async markAttendance(
    @Param('id') attendanceId: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.trainingService.markAttendance(attendanceId, dto.status);
  }

  @Post('feedback')
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    return this.trainingService.submitFeedback(dto);
  }

  @Post('create')
  async create(@Body() createTrainingDto: CreateTrainingDto) {
    return this.trainingService.createTraining(createTrainingDto);
  }

  @Get('upcoming')
  async getUpcoming(@Query('schoolId') schoolId: string) {
    if (!schoolId) {
      throw new BadRequestException('schoolId is required');
    }
    return this.trainingService.getUpcomingTrainings(schoolId);
  }
}
