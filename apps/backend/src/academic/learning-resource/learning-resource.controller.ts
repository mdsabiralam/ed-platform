import { Controller, Post, Body, Get, Param, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { LearningResourceService } from './learning-resource.service';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Academic - Learning Resources')
@Controller('academic/learning-resource')
@UseGuards(JwtAuthGuard)
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 201, description: 'The resource has been successfully created.' })
  async create(
    @Body() dto: CreateLearningResourceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file && !dto.url) {
      throw new BadRequestException('Either file or url must be provided');
    }
    return this.learningResourceService.create(dto, file);
  }

  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Get resources by topic' })
  @ApiResponse({ status: 200, description: 'List of resources for the topic.' })
  async findAllByTopic(@Param('topicId') topicId: string) {
    return this.learningResourceService.findAllByTopic(topicId);
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended resources based on weak topics' })
  @ApiResponse({ status: 200, description: 'List of recommended resources.' })
  async getRecommendedResources(@Req() req: any) {
    const studentId = req.user?.id || req.headers['x-user-id'];
    if (!studentId) {
       throw new Error('User ID not found in request');
    }
    return this.learningResourceService.getRecommendedResources(studentId);
  }
}
