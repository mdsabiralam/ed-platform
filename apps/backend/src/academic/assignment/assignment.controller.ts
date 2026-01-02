import { Controller, Post, Body, Param, Put, Req } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Academic - Assignment')
@Controller('academic/assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post('submission/:id/redo')
  @ApiOperation({ summary: 'Request resubmission from student' })
  @ApiBody({ schema: { type: 'object', properties: { remarks: { type: 'string' } } } })
  async requestResubmission(
    @Param('id') submissionId: string,
    @Body('remarks') remarks: string,
  ) {
    return this.assignmentService.requestResubmission(submissionId, remarks);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit or resubmit an assignment' })
  @ApiBody({ schema: { type: 'object', properties: { content: { type: 'string' }, fileUrl: { type: 'string' }, studentId: { type: 'string' } } } })
  async submitAssignment(
    @Param('id') assignmentId: string,
    @Body() body: { content?: string; fileUrl?: string; studentId: string },
  ) {
    return this.assignmentService.submitAssignment(
      assignmentId,
      body.studentId,
      body.content,
      body.fileUrl,
    );
  }
}
