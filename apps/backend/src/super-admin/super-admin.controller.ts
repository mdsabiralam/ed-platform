import { Controller, Post, Body, UseGuards, Request, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { ImpersonateUserDto } from './dto/impersonate-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ImpersonateGuard } from '../common/guards/impersonate.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Super Admin')
@Controller('api/super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post('impersonate')
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(ImpersonateGuard)
  @ApiOperation({ summary: 'Impersonate a user (God Mode)' })
  @ApiResponse({ status: 201, description: 'JWT tokens generated for the target user.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async impersonate(@Request() req: any, @Body() dto: ImpersonateUserDto, @Ip() ip: string) {
    const adminUserId = req.user.sub; // Or req.user.id depending on guard mapping, usually sub is userId
    return this.superAdminService.impersonateUser(adminUserId, dto.targetUserId, ip);
  }
}
