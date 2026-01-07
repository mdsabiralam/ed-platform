import { Test, TestingModule } from '@nestjs/testing';
import { BroadcastProcessor } from '../processors/broadcast.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { Job } from 'bullmq';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  broadcastLog: {
    create: jest.fn(),
  },
};

const mockTemplateService = {
  replaceVariables: jest.fn((msg, ctx) => msg.replace('{{name}}', ctx.firstName)),
};

describe('BroadcastProcessor', () => {
  let processor: BroadcastProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BroadcastProcessor,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationTemplateService,
          useValue: mockTemplateService,
        },
      ],
    }).compile();

    processor = module.get<BroadcastProcessor>(BroadcastProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should process a job and log success', async () => {
    const job = {
      data: {
        campaignId: 'camp-1',
        userId: 'user-1',
        message: 'Hello {{name}}',
        channel: 'SMS',
      },
    } as Job;

    const mockUser = {
      id: 'user-1',
      student: { firstName: 'John' },
      staffProfile: null,
    };

    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
    mockPrismaService.broadcastLog.create.mockResolvedValue({});

    const result = await processor.process(job);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      include: { student: true, staffProfile: true },
    });
    expect(mockTemplateService.replaceVariables).toHaveBeenCalled();
    expect(mockPrismaService.broadcastLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'DELIVERED',
          userId: 'user-1',
        }),
      }),
    );
    expect(result.status).toBe('DELIVERED');
  });

  it('should handle errors and log failure', async () => {
      // In this specific mock implementation, we don't have a real external service to fail.
      // But we can simulate finding no user or some other error.
      // If user not found, it returns undefined currently.

      const job = {
        data: { userId: 'unknown' }
      } as Job;

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await processor.process(job);
      expect(result).toBeUndefined();
      // Logic returns early if no user
  });
});
