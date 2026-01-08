import { Controller, Post, Body, Param } from '@nestjs/common';
import { AssignmentService } from './assignment.service';

@Controller('concierge_requests')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post(':id/publish')
  create(@Param('id') id: string, @Body() data: any) {
    return this.assignmentService.create(id, data);
  }
}
