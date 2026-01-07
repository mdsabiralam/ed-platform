import { Test, TestingModule } from '@nestjs/testing';
import { SlaMonitorService } from './sla/sla-monitor.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

// Define mocks for Enums as @prisma/client is not available/working in this sandbox environment
const TicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

const TicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
};

const UserRole = {
  PRINCIPAL: 'PRINCIPAL',
};

// Mock the imported PrismaClient enums in the Service file during test
// Since we can't easily module-alias inside the test environment without setup,
// we will rely on the fact that the Service imports from @prisma/client.
// But wait, the Service imports from @prisma/client, which is BROKEN in this environment.
// So the Service fails to load because it imports undefined.

// To fix the TEST in this BROKEN environment, we need to mock the module '@prisma/client'.
jest.mock('@prisma/client', () => ({
  TicketPriority: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
  TicketStatus: {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
  },
  UserRole: {
    PRINCIPAL: 'PRINCIPAL',
  },
  PrismaClient: jest.fn(),
}));


// Mock Prisma Client
const mockPrisma = {
  ticket: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  escalationLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  profile: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  user: {
    create: jest.fn(),
  },
  tenant: {
    create: jest.fn(),
  },
  ticketCategory: {
    create: jest.fn(),
  },
  slaPolicy: {
    create: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrisma)),
  $disconnect: jest.fn(),
};

describe('SlaMonitorService Integration (Simulation)', () => {
  let service: SlaMonitorService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlaMonitorService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SlaMonitorService>(SlaMonitorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('10. Simulation Test (Time Travel)', async () => {
    // Setup Mock Data
    const tenantId = 'tenant-1';
    const principalUserId = 'principal-user-1';
    const originalAssigneeId = 'staff-1';
    const ticketId = 'ticket-breached';

    const now = new Date();
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

    const mockPolicy = {
      priority: TicketPriority.URGENT,
      maxResolutionTimeHours: 4,
    };

    const mockTicket = {
      id: ticketId,
      status: TicketStatus.OPEN,
      priority: TicketPriority.URGENT,
      createdAt: fiveHoursAgo,
      tenantId: tenantId,
      assignedToId: originalAssigneeId,
      category: {
        policies: [mockPolicy],
      },
    };

    const mockPrincipalProfile = {
      userId: principalUserId,
    };

    // Mock Responses
    mockPrisma.ticket.findMany.mockResolvedValue([mockTicket]);
    mockPrisma.profile.findFirst.mockResolvedValue(mockPrincipalProfile);

    // Run Logic
    await service.checkSlaBreaches();

    // Verify Escalation Logic
    expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
      where: {
        status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
      },
      include: {
        category: {
          include: {
            policies: true,
          },
        },
      },
    });

    expect(mockPrisma.profile.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId: tenantId,
        role: UserRole.PRINCIPAL,
      },
      include: { user: true },
    });

    // Verify Transaction calls
    expect(mockPrisma.escalationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ticketId: ticketId,
        originalAssigneeId: originalAssigneeId,
        escalatedToId: principalUserId,
      }),
    });

    expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
      where: { id: ticketId },
      data: {
        assignedToId: principalUserId,
        priority: TicketPriority.URGENT,
      },
    });

    console.log('Simulation Passed: Ticket Escalated to Principal (Verified via Mocks).');
  });
});
