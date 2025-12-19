import { Controller, Get } from '@nestjs/common';
import { SaasService } from './saas.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Plan } from '@prisma/client';

@ApiTags('SaaS')
@Controller('saas')
export class SaasController {
  constructor(private readonly saasService: SaasService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  getPlans(): Promise<Plan[]> {
    return this.saasService.getPlans();
  }
}
