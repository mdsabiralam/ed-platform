import { Controller, Post, Get, Body, Query, BadRequestException } from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

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
