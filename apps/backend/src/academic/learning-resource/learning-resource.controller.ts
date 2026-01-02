import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LearningResourceService } from './learning-resource.service';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';

@ApiTags('Academic - Learning Resources')
@Controller('academic/learning-resource')
export class LearningResourceController {
  constructor(private readonly learningResourceService: LearningResourceService) {}

  @Post(':id/view')
  @ApiOperation({ summary: 'Track resource view' })
  @ApiResponse({ status: 201, description: 'View tracked successfully.' })
  async trackView(@Param('id') id: string, @Req() req: any) {
    // Assuming user ID is attached to the request by AuthGuard, even if not explicitly used here yet.
    // In a real scenario, we'd use a custom decorator like @User() to get the ID.
    // Fallback to a header or mock for now if auth isn't fully set up in this context,
    // but the instruction implies standard auth.
    // Accessing req.user.id or req.headers['x-user-id']
    const studentId = req.user?.id || req.headers['x-user-id'];
    if (!studentId) {
        // Just return if no user, or throw unauthorized. For tracking, maybe silent fail?
        // Let's assume valid studentId is required.
        throw new Error('User ID not found in request');
    }
    return this.learningResourceService.trackView(studentId, id);
  }

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
