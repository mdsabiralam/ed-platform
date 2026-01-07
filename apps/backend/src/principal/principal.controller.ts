import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PrincipalService } from './principal.service';

@Controller('principal')
export class PrincipalController {
  constructor(private readonly principalService: PrincipalService) {}

  @Get('approvals')
  async getPendingApprovals() {
    return this.principalService.getPendingApprovals();
  }

  @Post('approve-leave/:id')
  async approveLeave(@Param('id') id: string) {
    return this.principalService.approveLeave(id);
  }

  @Post('reject-leave/:id')
  async rejectLeave(@Param('id') id: string, @Body('reason') reason: string) {
    return this.principalService.rejectLeave(id, reason);
  }

  @Get('attendance/staff')
  async getStaffAttendanceStats() {
    return this.principalService.getStaffAttendanceStats();
  }

  @Post('observation')
  async createObservation(@Body() data: any) {
    return this.principalService.createObservation(data);
  }

  @Get('search')
  async globalSearch(@Query('query') query: string) {
    return this.principalService.globalSearch(query);
  }

  @Post('broadcast')
  async sendBroadcast(@Body() data: any) {
    return this.principalService.sendBroadcast(data);
  }

  @Get('finance')
  async getFinancialPulse() {
    return this.principalService.getFinancialPulse();
  }

  @Get('defaulters')
  async getDefaulters() {
    return this.principalService.getDefaulters();
  }

  @Get('substitution')
  async getSubstitutionView() {
    return this.principalService.getSubstitutionView();
  }

  @Post('substitution/assign')
  async assignSubstitute(@Body() data: any) {
    return this.principalService.assignSubstitute(data);
  }
}
