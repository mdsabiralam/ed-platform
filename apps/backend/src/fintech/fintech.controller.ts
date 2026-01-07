import { Controller, Post, Body } from '@nestjs/common';
import { FintechService } from './fintech.service';
import { LoanApplicationDto, DisbursementWebhookDto } from './dto/loan-application.dto';

@Controller('api/fintech')
export class FintechController {
  constructor(private fintechService: FintechService) {}

  @Post('eligibility')
  checkEligibility(@Body() dto: LoanApplicationDto) {
    return this.fintechService.checkEligibility(dto);
  }

  @Post('webhook/disbursement')
  handleWebhook(@Body() dto: DisbursementWebhookDto) {
    return this.fintechService.handleDisbursementWebhook(dto);
  }
}
