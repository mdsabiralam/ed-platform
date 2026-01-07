import { Test, TestingModule } from '@nestjs/testing';
import { BroadcastService } from './broadcast.service';
import { CommunicationService } from './communication.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('Communication Logic', () => {
  let broadcastService: BroadcastService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BroadcastService,
        CommunicationService,
        {
          provide: PrismaService,
          useValue: {
            // Mock prisma if needed
          },
        },
        {
          provide: ConfigService,
          useValue: {
             get: jest.fn(),
          }
        }
      ],
    }).compile();

    broadcastService = module.get<BroadcastService>(BroadcastService);
  });

  describe('BroadcastService - Quiet Hours', () => {
    it('should calculate delay during quiet hours (e.g. 11 PM)', async () => {
      // Mock Date to 11 PM
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01T23:00:00'));

      const result = await broadcastService.sendNotification('test', false);

      // Should delay until 6 AM next day (7 hours = 7 * 60 * 60 * 1000 = 25200000ms)
      expect(result.delay).toBe(25200000);
    });

    it('should NOT delay during day time (e.g. 2 PM)', async () => {
       jest.useFakeTimers().setSystemTime(new Date('2024-01-01T14:00:00'));
       const result = await broadcastService.sendNotification('test', false);
       expect(result.delay).toBe(0);
    });

    it('should NOT delay if emergency even during quiet hours', async () => {
       jest.useFakeTimers().setSystemTime(new Date('2024-01-01T23:00:00'));
       const result = await broadcastService.sendNotification('test', true);
       expect(result.delay).toBe(0);
    });
  });
});
