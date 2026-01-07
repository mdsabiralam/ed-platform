import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Correct relative path from apps/backend/src/helpdesk/ticket.service.ts
import { CreateTicketDto, AddCommentDto, ReassignTicketDto } from './dto/create-ticket.dto';
import { TicketRoutingConfig } from './config/ticket-routing.config';
import { TicketCategory, UserRole, TicketPriority, TicketStatus } from '@prisma/client';
import { MailService } from '../shared/mail/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(tenantId: string, userId: string, dto: CreateTicketDto) {
    let assignedToId: string | null = null;
    let priority = dto.priority || TicketPriority.LOW;

    // 7. Priority Matrix Automation
    const sensitiveKeywords = ['Harassment', 'Bullying', 'Emergency', 'Accident'];
    const textToCheck = `${dto.title} ${dto.description}`;
    if (sensitiveKeywords.some(keyword => new RegExp(keyword, 'i').test(textToCheck))) {
      priority = TicketPriority.URGENT;
    }

    // 2. & 3. Auto-Assign Logic
    if (dto.category === TicketCategory.FEES ||
        dto.category === TicketCategory.ACCOUNTS ||
        /Fee|Payment|Due/i.test(dto.title) ||
        /Fee|Payment|Due/i.test(dto.description)) {

      // Specific Logic: Fees -> Accountant (High Priority Rule)
      const accountant = await this.prisma.profile.findFirst({
        where: {
          tenantId,
          role: UserRole.ACCOUNTANT
        },
        include: { user: true }
      });
      if (accountant) {
        assignedToId = accountant.userId;
      }
    } else {
      // General Routing
      const targetRole = TicketRoutingConfig[dto.category];
      if (targetRole) {
        // 5. Round Robin / Least Loaded
        const candidates = await this.prisma.profile.findMany({
          where: {
            tenantId,
            role: targetRole
          }
        });

        if (candidates.length > 0) {
           const candidateUserIds = candidates.map(c => c.userId);

           const workload = await this.prisma.ticket.groupBy({
             by: ['assignedToId'],
             where: {
               assignedToId: { in: candidateUserIds },
               status: TicketStatus.OPEN
             },
             _count: {
               id: true
             }
           });

           // Default everyone to 0 load
           const loadMap = new Map<string, number>();
           candidateUserIds.forEach(id => loadMap.set(id, 0));
           workload.forEach(w => {
             if (w.assignedToId) loadMap.set(w.assignedToId, w._count.id);
           });

           // Find min load
           let minLoad = Infinity;
           let selectedCandidate = candidateUserIds[0];

           for (const [uid, load] of loadMap.entries()) {
             if (load < minLoad) {
               minLoad = load;
               selectedCandidate = uid;
             }
           }
           assignedToId = selectedCandidate;
        }
      }
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        tenantId,
        createdById: userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority,
        status: TicketStatus.OPEN,
        assignedToId
      }
    });

    if (assignedToId) {
      this.eventEmitter.emit('ticket.assigned', ticket);
    }

    return ticket;
  }

  async reassign(ticketId: string, userId: string, dto: ReassignTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { assignedTo: true, createdBy: true } // verify ownership
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // Only Admins or Current Assignee
    const userProfile = await this.prisma.profile.findFirst({
      where: { userId, tenantId: ticket.tenantId }
    });

    const isAdmin = userProfile?.role === UserRole.ADMIN || userProfile?.role === UserRole.SUPER_ADMIN;
    const isAssignee = ticket.assignedToId === userId;

    if (!isAdmin && !isAssignee) {
      throw new ForbiddenException('You are not authorized to reassign this ticket');
    }

    // Validate new assignee
    const newAssigneeProfile = await this.prisma.profile.findFirst({
       where: { userId: dto.newAssignedToId, tenantId: ticket.tenantId }
    });

    if (!newAssigneeProfile || [UserRole.STUDENT, UserRole.PARENT].includes(newAssigneeProfile.role)) {
       throw new BadRequestException('Invalid assignee. Must be a staff member.');
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedToId: dto.newAssignedToId }
    });

    this.eventEmitter.emit('ticket.assigned', updatedTicket);

    return updatedTicket;
  }

  async getMyQueue(userId: string) {
    // 8. Staff 'My Queue' Dashboard API
    return this.prisma.ticket.findMany({
      where: { assignedToId: userId },
      orderBy: [
        { priority: 'desc' }, // URGENT > HIGH > MEDIUM > LOW
        { createdAt: 'asc' } // Oldest first
      ]
    });
  }

  async addComment(ticketId: string, userId: string, dto: AddCommentDto) {
    return this.prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        content: dto.content,
        isInternal: dto.isInternal || false
      }
    });
  }

  async getTicketDetails(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        comments: {
           include: { user: true },
           orderBy: { createdAt: 'asc' }
        },
        createdBy: true,
        assignedTo: true
      }
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // 6. Internal Notes Logic
    const userProfile = await this.prisma.profile.findFirst({
      where: { userId, tenantId: ticket.tenantId }
    });

    const isStaffOrAdmin = userProfile && ![UserRole.STUDENT, UserRole.PARENT].includes(userProfile.role);

    if (!isStaffOrAdmin) {
      ticket.comments = ticket.comments.filter(c => !c.isInternal);
    }

    return ticket;
  }
}
