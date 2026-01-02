import { Controller, Post, Get, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssignmentService } from './assignment.service';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Academic - Submission')
@Controller('academic/submission')
export class SubmissionController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get submission details' })
  async getSubmission(@Param('id') submissionId: string) {
    return this.assignmentService.getSubmission(submissionId);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Save marks and feedback' })
  @ApiBody({ schema: { type: 'object', properties: { teacherFeedback: { type: 'string' }, obtainedMarks: { type: 'number' } } } })
  async saveFeedback(
    @Param('id') submissionId: string,
    @Body() body: { teacherFeedback: string; obtainedMarks: number },
  ) {
    return this.assignmentService.saveFeedback(submissionId, body.teacherFeedback, body.obtainedMarks);
  }

  @Post(':id/feedback-audio')
  @ApiOperation({ summary: 'Upload audio feedback' })
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
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/audio', // Ensure this directory exists or use a service to manage it
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadAudioFeedback(
    @Param('id') submissionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // In a real app, you'd serve this via a static file server or S3.
    // For now, return the local path or a constructed URL.
    // Assuming backend serves 'uploads' statically or we just return path.
    const fileUrl = `/uploads/audio/${file.filename}`;
    return this.assignmentService.saveAudioFeedback(submissionId, fileUrl);
  }

  @Post(':id/annotations')
  @ApiOperation({ summary: 'Save PDF annotations' })
  @ApiBody({ schema: { type: 'object', properties: { annotations: { type: 'object' } } } })
  async saveAnnotations(
    @Param('id') submissionId: string,
    @Body('annotations') annotations: any,
  ) {
    return this.assignmentService.saveAnnotations(submissionId, annotations);
  }
}
