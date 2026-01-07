import { Controller, Post, Body, Get, UseGuards, Req, Param, Put, ForbiddenException, UseInterceptors } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CommunicationAuditInterceptor } from './communication.interceptor';
import { BlockedUserGuard } from './blocked-user.guard';
import { ProfanityCheckPipe } from './profanity.pipe';

// DTOs
export class CallBridgeDto {
  staffId: string;
  parentId: string;
}

export class BlockRequestDto {
  staffId: string;
  targetUserId: string;
  reason: string;
}

export class ReportAbuseDto {
  messageId: string;
  reason: 'HARASSMENT' | 'SPAM' | 'INAPPROPRIATE';
  comments?: string;
}

export class ResolveFlagDto {
  action: 'MARK_SAFE' | 'DELETE_MESSAGE' | 'SANCTION_USER';
}

export class SendMessageDto {
  recipientId: string;
  content: string;
  // Injected by pipe
  isFlagged?: boolean;
}

@ApiTags('Communication')
@Controller('api/communication')
@UseGuards(BlockedUserGuard) // 8.I.02 Block Enforcement
@UseInterceptors(CommunicationAuditInterceptor) // 8.I.03 Audit Logging Interceptor
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post('call-bridge')
  @ApiOperation({ summary: 'Trigger a masked call between staff and parent (8.I.01)' })
  async triggerCallBridge(@Body() dto: CallBridgeDto) {
    return this.communicationService.triggerCallBridge(dto);
  }

  @Post('block-request')
  @ApiOperation({ summary: 'Request to block an abusive parent (8.I.02)' })
  async createBlockRequest(@Body() dto: BlockRequestDto) {
    return this.communicationService.createBlockRequest(dto);
  }

  @Put('block-request/:id/approve')
  @ApiOperation({ summary: 'Approve a block request (Principal only)' })
  async approveBlockRequest(@Param('id') id: string) {
    // In real implementation, check role here
    return this.communicationService.approveBlockRequest(id);
  }

  @Post('report-abuse')
  @ApiOperation({ summary: 'Report abusive message (8.I.08)' })
  async reportAbuse(@Body() dto: ReportAbuseDto, @Req() req: any) {
    // Assuming req.user exists
    const reporterId = req.user?.id || 'mock-reporter-id';
    return this.communicationService.reportAbuse(reporterId, dto);
  }

  @Get('privacy-policy')
  @ApiOperation({ summary: 'Get privacy policy text/url (8.I.10)' })
  async getPrivacyPolicy(@Req() req: any) {
     const tenantId = req.headers['x-tenant-id'];
     return this.communicationService.getPrivacyPolicy(tenantId);
  }

  // Demo Endpoint to wire up Interceptor & Pipe
  @Post('send-message')
  @ApiOperation({ summary: 'Send a message (Demo for 8.I.03 & 8.I.04)' })
  // Pipe applies here
  async sendMessage(@Body(new ProfanityCheckPipe()) dto: SendMessageDto, @Req() req: any) {
    const senderId = req.user?.id || 'mock-sender-id';
    return this.communicationService.sendMessage(senderId, dto);
  }
}

@ApiTags('Admin Moderation')
@Controller('api/admin/moderation')
export class AdminModerationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Get('flagged-messages')
  @ApiOperation({ summary: 'Get flagged messages for review (8.I.09)' })
  async getFlaggedMessages() {
    return this.communicationService.getFlaggedMessages();
  }

  @Post('resolve/:messageId')
  @ApiOperation({ summary: 'Resolve flagged message (Mark Safe, Delete, Sanction) (8.I.09)' })
  async resolveFlag(@Param('messageId') messageId: string, @Body() dto: ResolveFlagDto) {
    return this.communicationService.resolveFlag(messageId, dto.action);
  }
}
