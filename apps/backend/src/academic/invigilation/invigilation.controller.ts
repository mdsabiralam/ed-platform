import { Controller, Post, Body } from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { AssignDutyDto } from './dto/assign-duty.dto';

@Controller('academic/invigilation')
export class InvigilationController {
  constructor(private readonly invigilationService: InvigilationService) {}

  @Post('assign')
  async assignDuty(@Body() dto: AssignDutyDto) {
    return this.invigilationService.assignDuty(dto);
  }
}
