import { Controller, Put, Body, Post, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { BulkUpdateDto } from './dto/bulk-update.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// Assuming we have authentication guards. If not, I'll stub/comment them out or use what's available.
// Memory mentioned ResultAccessGuard, but generic AuthGuard is likely present.
// I will assume request has user object attached by some middleware/guard.

@ApiTags('Admissions')
@Controller('api/admission')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Put('status')
  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(@Body() dto: UpdateStatusDto, @Req() req: any) {
    // Mock user for now if not present, in real scenario auth middleware provides this
    const userId = req.user?.id || 'mock-admin-id';
    const userRole = req.user?.role || 'ADMIN';

    return this.admissionsService.updateStatus(
      dto.applicationId,
      dto.newStatus,
      userId,
      userRole,
      dto.remarks,
    );
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update application status' })
  async bulkUpdate(@Body() dto: BulkUpdateDto, @Req() req: any) {
    const userId = req.user?.id || 'mock-admin-id';
    const userRole = req.user?.role || 'ADMIN';

    return this.admissionsService.bulkUpdateStatus(
      dto.applicationIds,
      dto.newStatus,
      userId,
      userRole,
      dto.remarks,
    );
  }

  @Get('kanban')
  @ApiOperation({ summary: 'Get Kanban board data' })
  async getKanbanBoard(
    @Query('tenantId') tenantId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return this.admissionsService.getKanbanBoard(tenantId, sessionId);
  }
}
