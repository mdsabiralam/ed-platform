import { Controller, Post, Body, Get, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { SubstitutionService } from './substitution.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Academic - Substitution')
@Controller('academic/substitution')
export class SubstitutionController {
  constructor(private readonly substitutionService: SubstitutionService) {}

  @ApiOperation({ summary: 'Assign a substitute teacher' })
  @ApiResponse({ status: 201, description: 'Substitute assigned successfully.' })
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

  @ApiOperation({ summary: 'Get pending substitutions' })
  @ApiResponse({ status: 200, description: 'List of pending substitutions.' })
  @Get('pending')
  async getPendingSubstitutions(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new BadRequestException('Tenant ID missing');

    return this.substitutionService.getPendingSubstitutions(tenantId as string);
  }
}
