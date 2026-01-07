import { Test, TestingModule } from '@nestjs/testing';
import { DeviceController } from './device.controller';
import { FcmService } from './fcm.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

describe('DeviceController', () => {
  let controller: DeviceController;
  let fcmService: FcmService;
  let prismaService: PrismaService;

  const mockFcmService = {
    sendPush: jest.fn().mockResolvedValue('msg-123'),
    sendPushToTopic: jest.fn().mockResolvedValue('msg-topic-123'),
  };

  const mockPrismaService = {
    userDevice: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        { provide: FcmService, useValue: mockFcmService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(AdminGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<DeviceController>(DeviceController);
    fcmService = module.get<FcmService>(FcmService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should create new device if not exists', async () => {
      mockPrismaService.userDevice.findUnique.mockResolvedValue(null);
      mockPrismaService.userDevice.create.mockResolvedValue({ id: 'dev-1' });

      const req = { user: { id: 'user-1' } };
      await controller.register({ token: 'tok-1', platform: 'ANDROID' }, req);

      expect(mockPrismaService.userDevice.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', fcmToken: 'tok-1', platform: 'ANDROID' },
      });
    });

    it('should update device user if exists but different', async () => {
      mockPrismaService.userDevice.findUnique.mockResolvedValue({ id: 'dev-1', userId: 'old-user' });

      const req = { user: { id: 'new-user' } };
      await controller.register({ token: 'tok-1', platform: 'ANDROID' }, req);

      expect(mockPrismaService.userDevice.update).toHaveBeenCalledWith({
        where: { id: 'dev-1' },
        data: { userId: 'new-user', lastActiveAt: expect.any(Date) },
      });
    });
  });

  describe('sendCustom', () => {
    it('should send to user devices', async () => {
      mockPrismaService.userDevice.findMany.mockResolvedValue([{ id: 'dev-1', fcmToken: 'tok-1' }]);

      await controller.sendCustom({ targetUserId: 'u-1', title: 'T', body: 'B' });

      expect(mockPrismaService.userDevice.findMany).toHaveBeenCalledWith({ where: { userId: 'u-1' } });
      expect(mockFcmService.sendPush).toHaveBeenCalledWith('tok-1', 'T', 'B', undefined, undefined);
      expect(mockPrismaService.notificationLog.create).toHaveBeenCalled();
    });

    it('should send to topic', async () => {
      await controller.sendCustom({ topic: 'news', title: 'T', body: 'B' });

      expect(mockFcmService.sendPushToTopic).toHaveBeenCalledWith('news', 'T', 'B', undefined, undefined);
      expect(mockPrismaService.notificationLog.create).toHaveBeenCalled();
    });
  });
});
