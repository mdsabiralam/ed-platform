import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CallBridgeDto, BlockRequestDto, ReportAbuseDto, ResolveFlagDto, SendMessageDto } from './communication.controller';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommunicationService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  // 8.I.01 Phone Number Masking (Click-to-Call)
  async triggerCallBridge(dto: CallBridgeDto) {
    // Mock integration with Twilio/Exotel
    // In a real app, we would fetch phone numbers from User/Profile and call the provider API
    // Ensure we don't return the numbers

    // Validate users exist
    const staff = await this.prisma.user.findUnique({ where: { id: dto.staffId } });
    const parent = await this.prisma.user.findUnique({ where: { id: dto.parentId } });

    if (!staff || !parent) throw new NotFoundException('User not found');

    // Simulate API call to provider
    console.log(`[Mock] Initiating bridge call between ${staff.id} and ${parent.id}`);

    return {
      status: 'initiated',
      message: 'Call bridge initiated. You will receive a call shortly.',
      providerRef: 'mock-call-ref-' + Date.now()
    };
  }

  // 8.I.02 Abusive Parent Blocking Workflow
  async createBlockRequest(dto: BlockRequestDto) {
    return this.prisma.blockRequest.create({
      data: {
        staffId: dto.staffId,
        targetUserId: dto.targetUserId,
        reason: dto.reason,
        status: 'PENDING'
      }
    });
  }

  async approveBlockRequest(requestId: string) {
    const request = await this.prisma.blockRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');

    if (request.status !== 'PENDING') throw new BadRequestException('Request already processed');

    // Transaction to update request status and block user
    return this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.blockRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
      });

      await tx.user.update({
        where: { id: request.targetUserId },
        data: { isBlockedByStaff: true }
      });

      return updatedRequest;
    });
  }

  // 8.I.08 Report Abuse
  async reportAbuse(reporterId: string, dto: ReportAbuseDto) {
    return this.prisma.abuseReport.create({
      data: {
        reporterId,
        messageId: dto.messageId,
        reason: dto.reason,
        comments: dto.comments
      }
    });
  }

  // 8.I.09 Admin Review Dashboard
  async getFlaggedMessages() {
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { isFlagged: true },
          { abuseReports: { some: {} } }
        ]
      },
      include: {
        abuseReports: true,
        sender: {
          select: { id: true, email: true } // PII Safe
        }
      }
    });
  }

  async resolveFlag(messageId: string, action: ResolveFlagDto['action']) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');

    if (action === 'MARK_SAFE') {
      return this.prisma.chatMessage.update({
        where: { id: messageId },
        data: { isFlagged: false }
      });
    } else if (action === 'DELETE_MESSAGE') {
      // Soft delete or hard delete? Schema has deletedAt
      return this.prisma.chatMessage.update({
        where: { id: messageId },
        data: { deletedAt: new Date(), content: '[Deleted by Admin]' }
      });
    } else if (action === 'SANCTION_USER') {
      // Block user temporarily?
      // Simple implementation: Block them
      await this.prisma.user.update({
        where: { id: message.senderId },
        data: { isBlockedByStaff: true }
      });
      return { status: 'User Sanctioned' };
    }
  }

  // Demo: Send Message
  async sendMessage(senderId: string, dto: SendMessageDto) {
    return this.prisma.chatMessage.create({
      data: {
        senderId,
        recipientId: dto.recipientId,
        content: dto.content,
        isFlagged: !!dto.isFlagged
      }
    });
  }

  // 8.I.10 Privacy Policy
  async getPrivacyPolicy(tenantId?: string) {
    let policyUrl = null;
    if (tenantId) {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      policyUrl = tenant?.privacyPolicyUrl;
    }

    // Fallback or static text if url not set
    return {
      privacyPolicyUrl: policyUrl,
      policyText: "Chats may be monitored for safety. Messages are stored for 1 year.",
      requiredConsent: true
    };
  }
}
