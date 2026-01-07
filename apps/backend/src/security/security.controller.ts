import { Controller, Post, Body, Get, UseGuards, Req, ForbiddenException, Ip } from '@nestjs/common';
import { BiometricService } from './biometric.service';
import { SecurityAuditService } from './security-audit.service';
// Assuming these guards exist based on memory/previous files or standard NestJS patterns
// If not, we'd mock them or import standard ones.
// UserRole is an enum, we need to import it.
import { UserRole } from '@prisma/client';
// We need to implement a basic RoleGuard or assume one exists.
// Given the environment, I'll simulate the guard behavior or check if `apps/backend/src/common/guards` exists.
// I'll assume standard Request with user attached.

@Controller('vision')
export class SecurityController {
  constructor(
    private readonly biometricService: BiometricService,
    private readonly auditService: SecurityAuditService,
  ) {}

  /**
   * Task 3: Access Control (RBAC)
   * Only SUPER_ADMIN or SECURITY_HEAD can register faces.
   */
  @Post('register-face')
  async registerFace(@Req() req: any, @Body() body: any) {
    // Mock user from request (Middleware usually attaches this)
    const user = req.user || { role: 'TEACHER', id: 'unknown' }; // Default to unauthorized for safety if missing

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'SECURITY_HEAD') {
      throw new ForbiddenException('Access denied: Requires SUPER_ADMIN or SECURITY_HEAD role');
    }

    const { studentId, vector, sourceUrl, metadata } = body;
    await this.biometricService.registerFace(studentId, vector, sourceUrl, metadata);
    return { success: true, message: 'Face registered successfully' };
  }

  /**
   * Task 4: Audit Logging (CCTV Usage)
   * Mock endpoint for CCTV stream access.
   */
  @Get('cctv/stream')
  async watchCctv(@Req() req: any, @Ip() ip: string) {
    const user = req.user || { id: 'anonymous' };
    await this.auditService.logAccess(user.id, 'CCTV Live Stream', ip);
    return { streamUrl: 'rtsp://mock-stream/cam1' };
  }

  @Get('evidence/clips')
  async viewEvidence(@Req() req: any, @Ip() ip: string) {
    const user = req.user || { id: 'anonymous' };
    await this.auditService.logAccess(user.id, 'Evidence Clips', ip);
    return { clips: [] };
  }
}
