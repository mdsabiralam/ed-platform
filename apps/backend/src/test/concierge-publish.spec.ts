import { Test, TestingModule } from '@nestjs/testing';
import { ConciergeService } from '../concierge/concierge.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { AssignmentService } from '../assignment/assignment.service';
import { NotificationService } from '../notifications/notification.service';
import { RequestStatus } from '@prisma/client';

describe('ConciergeService Publish Flow', () => {
  let service: ConciergeService;
  let prisma: PrismaService;
  let assignmentService: AssignmentService;
  let notificationService: NotificationService;

  const mockPrisma = {
    conciergeRequest: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAssignmentService = {
    createFromRequest: jest.fn(),
  };

  const mockNotificationService = {
    sendBulkNotification: jest.fn(),
  };

  const mockCls = {
    get: jest.fn().mockReturnValue('mock-school-id'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConciergeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ClsService, useValue: mockCls },
        { provide: AssignmentService, useValue: mockAssignmentService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<ConciergeService>(ConciergeService);
    prisma = module.get<PrismaService>(PrismaService);
    assignmentService = module.get<AssignmentService>(AssignmentService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should publish a request', async () => {
      const requestId = 'req-1';
      const dto = { title: 'Test HW', dueDate: '2025-01-30', classId: 'class-1' };

      mockPrisma.conciergeRequest.findFirst.mockResolvedValue({ id: requestId });
      mockAssignmentService.createFromRequest.mockResolvedValue({ id: 'assign-1', ...dto });

      await service.publish(requestId, dto);

      expect(assignmentService.createFromRequest).toHaveBeenCalledWith(requestId, dto, 'mock-school-id');
      expect(prisma.conciergeRequest.update).toHaveBeenCalledWith({
          where: { id: requestId },
          data: { status: RequestStatus.PUBLISHED }
      });
      expect(notificationService.sendBulkNotification).toHaveBeenCalled();
  });
});
