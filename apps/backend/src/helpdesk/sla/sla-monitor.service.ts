import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketPriority, TicketStatus, UserRole } from '@prisma/client';

@Injectable()
export class SlaMonitorService {
  private readonly logger = new Logger(SlaMonitorService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkSlaBreaches() {
    this.logger.log('Checking for breaches...');

    // 1. Find all open tickets
    const openTickets = await this.prisma.ticket.findMany({
      where: {
        status: {
          notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED],
        },
      },
      include: {
        category: {
          include: {
            policies: true,
          },
        },
      },
    });

    for (const ticket of openTickets) {
      // 2. Find policy for this ticket
      const policy = ticket.category.policies.find(
        (p) => p.priority === ticket.priority,
      );

      // If no policy exists, skip (or use default)
      if (!policy) {
        continue;
      }

      // 3. Calculate deadline
      const deadline = new Date(ticket.createdAt.getTime() + policy.maxResolutionTimeHours * 60 * 60 * 1000);
      const now = new Date();

      if (now > deadline) {
        this.logger.warn(`Ticket ${ticket.id} breached SLA. Escalating...`);
        await this.escalateTicket(ticket);
      }
    }
  }

  private async escalateTicket(ticket: any) {
    // Check if already escalated to urgent/high or if we want to avoid re-escalating the same ticket repeatedly
    // For now, we assume if it's breached, we reassign.
    // Ideally we should check if an EscalationLog already exists for this breach to avoid loops,
    // but the prompt implies "When a ticket breaches... reassign".

    // Check if already escalated recently?
    // Let's check if the current assignee is already the principal
    // First, find the principal for this tenant
    const principalProfile = await this.prisma.profile.findFirst({
      where: {
        tenantId: ticket.tenantId,
        role: UserRole.PRINCIPAL,
      },
      include: {
        user: true,
      },
    });

    if (!principalProfile) {
      this.logger.error(`No Principal found for tenant ${ticket.tenantId}. Cannot escalate.`);
      return;
    }

    const principalUserId = principalProfile.userId;

    if (ticket.assignedToId === principalUserId) {
      // Already assigned to principal
      return;
    }

    // Perform Escalation Transaction
    await this.prisma.$transaction(async (tx) => {
      // Create Escalation Log
      await tx.escalationLog.create({
        data: {
          ticketId: ticket.id,
          originalAssigneeId: ticket.assignedToId,
          escalatedToId: principalUserId,
          breachedAt: new Date(),
        },
      });

      // Update Ticket
      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          assignedToId: principalUserId,
          priority: TicketPriority.URGENT, // Auto update priority
        },
      });
    });

    // Notify Original Staff (Mock)
    if (ticket.assignedToId) {
      this.notifyStaff(ticket.assignedToId, ticket.id);
    }
  }

  private notifyStaff(staffId: string, ticketId: string) {
    // Mock Notification
    this.logger.log(`[Notification] To Staff ${staffId}: SLA Breach Alert: Ticket #${ticketId} has been escalated to the Principal due to delay.`);
  }
}
