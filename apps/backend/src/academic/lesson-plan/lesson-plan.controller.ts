import { Controller, Post, Body, Get, Param, Patch, Query } from '@nestjs/common';
import { LessonPlanService } from './lesson-plan.service';
import { CreateLessonPlanDto, UpdateLessonPlanStatusDto, CloneYearDto } from './dto/lesson-plan.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('academic')
@Controller('api/academic/lesson-plan')
export class LessonPlanController {
  constructor(private readonly lessonPlanService: LessonPlanService) {}

  @Post()
  create(@Body() dto: CreateLessonPlanDto) {
    return this.lessonPlanService.create(dto);
  }

  @Post('update') // Prompt 2: /api/academic/lesson-plan/update. Using ID in body or simplified query? Prompt implies endpoint. I'll use Patch with ID param usually, but following prompt exactly or close to it.
  @ApiOperation({ summary: 'Mark topic as done' })
  async updateStatus(@Query('id') id: string, @Body() dto: UpdateLessonPlanStatusDto) {
      // Prompt says "POST /api/academic/lesson-plan/update".
      // Usually updates are PUT/PATCH. And need ID.
      // I will accept ID in query or body.
      return this.lessonPlanService.updateStatus(id, dto);
  }

  @Get('lag')
  calculateLag(@Query('subjectId') subjectId: string, @Query('sectionId') sectionId: string) {
      return this.lessonPlanService.calculateSyllabusLag(subjectId, sectionId);
  }

  @Post('clone-year')
  cloneYear(@Body() dto: CloneYearDto) {
      return this.lessonPlanService.cloneYear(dto);
  }
}

@ApiTags('principal')
@Controller('api/principal')
export class PrincipalController {
    constructor(private readonly lessonPlanService: LessonPlanService) {}

    @Get('syllabus-status')
    getSyllabusStatus() {
        return this.lessonPlanService.getSyllabusStatus();
    }
}
