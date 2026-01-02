import { Controller, Post, UseInterceptors, UploadedFile, Body, Req, Get, Query, Put, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumPlanDto } from './dto/create-curriculum-plan.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ImportSyllabusDto } from './dto/import-syllabus.dto';

@ApiTags('Curriculum')
@Controller('academic/curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post('import')
  @ApiOperation({ summary: 'Import Syllabus from Excel (7.A.04)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportSyllabusDto })
  @UseInterceptors(FileInterceptor('file'))
  async importSyllabus(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateCurriculumPlanDto,
  ) {
    const tenantId = req.user?.tenantId;
    return this.curriculumService.importCurriculum(tenantId, file, body);
  }

  @Get(':planId')
  @ApiOperation({ summary: 'Get Syllabus Structure (Viewer 7.A.08)' })
  async getCurriculumStructure(
    @Req() req: any,
    @Param('planId') planId: string
  ) {
    return this.curriculumService.getCurriculumStructure(planId);
  }

  @Put('reorder-topics')
  @ApiOperation({ summary: 'Reorder topics (Editor 7.A.09)' })
  @ApiBody({ schema: { type: 'array', items: { type: 'object', properties: { topicId: { type: 'string' }, orderIndex: { type: 'integer' } } } } })
  async reorderTopics(
    @Req() req: any,
    @Body() body: { topicId: string; orderIndex: number }[]
  ) {
    const tenantId = req.user?.tenantId;
    return this.curriculumService.reorderTopics(tenantId, body);
  }

  @Post('complete-topic')
  @ApiOperation({ summary: 'Mark a topic as completed' })
  async completeTopic(@Req() req: any, @Body() body: { topicId: string; sectionId: string }) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    return this.curriculumService.markTopicCompleted(tenantId, body.topicId, userId, body.sectionId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Syllabus Completion Status' })
  async getStatus(
    @Req() req: any,
    @Query('classId') classId: string,
    @Query('subjectId') subjectId: string,
    @Query('sectionId') sectionId: string,
  ) {
    const tenantId = req.user?.tenantId;
    return this.curriculumService.getSyllabusStatus(tenantId, classId, subjectId, sectionId);
  }

  @Get('status/:subjectId/:sectionId')
  @ApiOperation({ summary: 'Get Syllabus Status (Generic Path)' })
  async getStatusByPath(
    @Req() req: any,
    @Param('subjectId') subjectId: string,
    @Param('sectionId') sectionId: string,
  ) {
    const tenantId = req.user?.tenantId;
    // classId will be resolved in service
    return this.curriculumService.getSyllabusStatus(tenantId, undefined, subjectId, sectionId);
  }

  @Get('parent/child/:studentId/topics-covered')
  @ApiOperation({ summary: 'Get Topics Covered This Week for Student (7.B.07)' })
  async getTopicsCovered(
    @Req() req: any,
    @Param('studentId') studentId: string,
  ) {
    const tenantId = req.user?.tenantId;
    return this.curriculumService.getTopicsCoveredForStudent(tenantId, studentId);
  }
}
