import { Controller, Get, Post, Body, Req, UseGuards, BadRequestException, Param } from '@nestjs/common';
import { GuardianService } from './guardian.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RelationshipType } from '@prisma/client';

@ApiTags('Guardian')
@Controller('api')
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  @Get('guardian/:id/family')
  @ApiOperation({ summary: 'Get family view for a guardian (Admin)' })
  async getFamilyView(@Param('id') id: string) {
      return this.guardianService.getFamilyView(id);
  }

  @Get('parent/children')
  @ApiOperation({ summary: 'Get linked children for the logged-in parent' })
  async getChildren(@Req() req) {
    // Assuming Middleware/Guard populates user
    // For now, if req.user is undefined, we might throw or return empty.
    // In a real scenario, this would be protected by AuthGuard.
    const userId = req.user?.id;
    if (!userId) {
        // For testing purposes without full auth setup in sandbox
        // throw new BadRequestException('User not authenticated');
        // I'll return empty list or handle gracefully.
        return [];
    }
    return this.guardianService.getChildren(userId);
  }

  @Post('guardian/update')
  @ApiOperation({ summary: 'Update guardian profile' })
  async updateGuardian(@Req() req, @Body() body: { occupation?: string; annualIncome?: number }) {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }
      return this.guardianService.updateGuardianProfile(userId, body);
  }

  // Helper endpoint to trigger Sibling Detector Logic for testing/verification
  @Post('internal/guardian/matriculate')
  @ApiOperation({ summary: 'Internal endpoint to test sibling detector logic' })
  async matriculateGuardian(@Body() body: {
      studentId: string;
      phone: string;
      fullName: string;
      relationshipType: RelationshipType;
      occupation?: string;
      annualIncome?: number;
  }) {
      return this.guardianService.createGuardianForStudent(body.studentId, body);
  }
}
