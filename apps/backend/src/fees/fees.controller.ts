import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FeesService } from './fees.service';

@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get('student/:studentId')
  async getStudentFees(@Param('studentId') studentId: string) {
    return this.feesService.getStudentFees(studentId);
  }

  @Post('pay')
  async payFee(@Body() body: { feeId: string; paymentMethod: string }) {
    return this.feesService.payFee(body.feeId, body.paymentMethod);
  }
}
