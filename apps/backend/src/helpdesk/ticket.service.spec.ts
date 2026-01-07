import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../shared/mail/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketCategory, TicketPriority, TicketStatus, UserRole } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TicketService Verification', () => {
  let service: TicketService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  const mockPrisma = {
    profile: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    ticket: {
      create: jest.fn(),
      groupBy: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    ticketComment: {
      create: jest.fn()
    }
  };

  const mockMailService = {
    sendEmail: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MailService, useValue: mockMailService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('10. Verification Test (Department Isolation)', () => {
    it('should prevent Accountants from viewing Transport tickets in My Queue', async () => {
        // Setup: Ticket assigned to Transport Manager
        const transportTicket = {
            id: 'ticket-1',
            category: TicketCategory.TRANSPORT,
            assignedToId: 'transport-manager-id',
            status: TicketStatus.OPEN
        };

        // Attempting to call getMyQueue as Accountant
        const accountantId = 'accountant-id';

        // Mock return for findMany
        mockPrisma.ticket.findMany.mockResolvedValue([]);

        const result = await service.getMyQueue(accountantId);

        // Verification: The query should filter by assignedToId = accountantId
        expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { assignedToId: accountantId }
        }));

        // Since the ticket is assigned to transport manager, accountant gets empty list
        expect(result).toEqual([]);
    });
  });

  describe('Auto-Assign Logic', () => {
    it('should auto-assign FEES category to Accountant', async () => {
        mockPrisma.profile.findFirst.mockResolvedValue({ userId: 'accountant-id', role: UserRole.ACCOUNTANT });
        mockPrisma.ticket.create.mockResolvedValue({ id: 't1', assignedToId: 'accountant-id' });

        await service.create('tenant-1', 'user-1', {
            title: 'Fee Issue',
            description: 'Payment error',
            category: TicketCategory.FEES
        });

        // Adjusted expectation: findFirst takes { where: { ... } }
        expect(mockPrisma.profile.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ role: UserRole.ACCOUNTANT })
        }));
        // Adjusted expectation: create takes { data: { ... } }
        expect(mockPrisma.ticket.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ assignedToId: 'accountant-id' })
        }));
    });

    it('should auto-assign TRANSPORT category to Transport Manager', async () => {
        // General routing
        mockPrisma.profile.findMany.mockResolvedValue([{ userId: 'tm-1', role: UserRole.TRANSPORT_MANAGER }]);
        mockPrisma.ticket.groupBy.mockResolvedValue([]); // No load
        mockPrisma.ticket.create.mockResolvedValue({ id: 't2', assignedToId: 'tm-1' });

        await service.create('tenant-1', 'user-1', {
            title: 'Bus Issue',
            description: 'Late bus',
            category: TicketCategory.TRANSPORT
        });

        expect(mockPrisma.profile.findMany).toHaveBeenCalledWith(expect.objectContaining({
             where: expect.objectContaining({ role: UserRole.TRANSPORT_MANAGER })
        }));
        expect(mockPrisma.ticket.create).toHaveBeenCalledWith(expect.objectContaining({
             data: expect.objectContaining({ assignedToId: 'tm-1' })
        }));
    });
  });

  describe('Priority Matrix', () => {
      it('should force URGENT priority for sensitive keywords', async () => {
        mockPrisma.ticket.create.mockResolvedValue({});

        await service.create('tenant-1', 'user-1', {
            title: 'Emergency accident',
            description: 'Something happened',
            category: TicketCategory.OTHER
        });

        expect(mockPrisma.ticket.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ priority: TicketPriority.URGENT })
        }));
      });
  });
});
