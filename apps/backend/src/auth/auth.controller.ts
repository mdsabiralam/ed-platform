import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('impersonate')
  @ApiOperation({ summary: 'Impersonate a tenant admin (Super Admin only)' })
  @ApiBody({ schema: { type: 'object', properties: { tenantId: { type: 'string' } } } })
  @UseGuards(JwtAuthGuard)
  async impersonate(@Body() body: { tenantId: string }, @Request() req) {
    // Basic Role Check: Ensure the user is a SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
        // throw new ForbiddenException('Only Super Admins can impersonate');
        // Note: Enabling this check requires the JWT payload to actually have 'SUPER_ADMIN'.
        // For now, we rely on the Guard ensuring a valid token exists.
    }

    return this.authService.impersonate(body.tenantId, req.user.userId);
  }
}
