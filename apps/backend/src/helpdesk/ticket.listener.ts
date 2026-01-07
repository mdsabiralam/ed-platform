import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../shared/mail/mail.service';
import { Ticket } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketListener {
  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService
  ) {}

  @OnEvent('ticket.assigned')
  async handleTicketAssignedEvent(ticket: Ticket) {
    if (!ticket.assignedToId) return;

    const staff = await this.prisma.user.findUnique({
      where: { id: ticket.assignedToId }
    });

    if (staff && staff.email) {
      const subject = `New Ticket Assigned: ${ticket.title} - Priority: ${ticket.priority}`;
      const content = `A new ticket has been assigned to you.\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nLink: /helpdesk/tickets/${ticket.id}`;

      await this.mailService.sendEmail(staff.email, subject, content);
    }
  }
}
