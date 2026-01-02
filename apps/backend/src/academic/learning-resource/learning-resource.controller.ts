import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LearningResourceService } from './learning-resource.service';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';

@ApiTags('Academic - Learning Resources')
@Controller('academic/learning-resource')
export class LearningResourceController {
  constructor(private readonly learningResourceService: LearningResourceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a learning resource' })
  @ApiResponse({ status: 201, description: 'The resource has been successfully created.' })
  async create(@Body() dto: CreateLearningResourceDto) {
    return this.learningResourceService.create(dto);
  }

  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Get resources by topic' })
  @ApiResponse({ status: 200, description: 'List of resources for the topic.' })
  async findAllByTopic(@Param('topicId') topicId: string) {
    return this.learningResourceService.findAllByTopic(topicId);
  }
}
