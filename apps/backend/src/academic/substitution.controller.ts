import { Controller, Post, Body, Get, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { SubstitutionService } from './substitution.service';

@Controller('academic/substitution')
export class SubstitutionController {
  constructor(private readonly substitutionService: SubstitutionService) {}

  @Post('assign')
  async assignSubstitute(@Body() body: { substitutionId: string; substituteTeacherId: string }, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new BadRequestException('Tenant ID missing');

    return this.substitutionService.assignSubstitute(
      tenantId as string,
      body.substitutionId,
      body.substituteTeacherId,
    );
  }

  @Get('pending')
  async getPendingSubstitutions(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new BadRequestException('Tenant ID missing');

    return this.substitutionService.getPendingSubstitutions(tenantId as string);
  }
}
