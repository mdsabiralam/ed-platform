import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationService } from '../communication.service';
import { AudienceService } from '../services/audience.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { BroadcastChannel } from '@prisma/client';

const mockPrismaService = {
  broadcastCampaign: {
    create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'campaign-123', ...args.data })),
    update: jest.fn(),
  },
};

const mockQueue = {
  addBulk: jest.fn().mockResolvedValue([]),
};

const mockAudienceService = {
  fetchUsers: jest.fn(),
};

describe('CommunicationService', () => {
  let service: CommunicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AudienceService,
          useValue: mockAudienceService,
        },
        {
          provide: getQueueToken('broadcast_queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<CommunicationService>(CommunicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCampaign', () => {
    it('should create campaign and queue jobs', async () => {
      const dto: CreateCampaignDto = {
        title: 'Test',
        messageBody: 'Hello',
        channel: BroadcastChannel.SMS,
        filter: { classId: 'class-1' },
      };

      const mockUsers = [{ id: 'user-1' }, { id: 'user-2' }];
      mockAudienceService.fetchUsers.mockResolvedValue(mockUsers);

      const result = await service.createCampaign(dto, 'sender-1');

      expect(mockPrismaService.broadcastCampaign.create).toHaveBeenCalled();
      expect(mockAudienceService.fetchUsers).toHaveBeenCalledWith(dto.filter);
      expect(mockQueue.addBulk).toHaveBeenCalled();
      expect(result.campaignId).toBe('campaign-123');
      expect(result.userCount).toBe(2);
    });
  });

  describe('estimateCost', () => {
    it('should calculate SMS cost correctly', async () => {
      const dto: CreateCampaignDto = {
        title: 'Test',
        messageBody: 'A'.repeat(161), // 2 parts
        channel: BroadcastChannel.SMS,
        filter: { classId: 'class-1' },
      };

      const mockUsers = new Array(10).fill({ id: 'u' });
      mockAudienceService.fetchUsers.mockResolvedValue(mockUsers);

      const result = await service.estimateCost(dto);

      expect(result.userCount).toBe(10);
      // 10 users * 2 parts * 0.5 rate = 10
      expect(result.estimatedCost).toBe(10);
    });
  });
});
