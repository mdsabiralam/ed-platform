import { Test, TestingModule } from '@nestjs/testing';
import { FcmService } from './fcm.service';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  return {
    apps: [],
    credential: {
      applicationDefault: jest.fn(),
    },
    initializeApp: jest.fn(),
    messaging: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue('projects/test-project/messages/fake-message-id'),
      subscribeToTopic: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 }),
    }),
  };
});

describe('FcmService', () => {
  let service: FcmService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcmService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'GOOGLE_APPLICATION_CREDENTIALS') return '/path/to/creds.json';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FcmService>(FcmService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize firebase admin on module init', () => {
    service.onModuleInit();
    expect(admin.initializeApp).toHaveBeenCalled();
  });

  it('should send a push notification', async () => {
    const token = 'fake-token';
    const title = 'Hello';
    const body = 'World';
    const data = { key: 'value' };

    const messageId = await service.sendPush(token, title, body, data);

    expect(admin.messaging().send).toHaveBeenCalledWith(expect.objectContaining({
      token,
      notification: { title, body },
      data,
    }));
    expect(messageId).toBe('projects/test-project/messages/fake-message-id');
  });

  it('should send a silent push notification', async () => {
    const token = 'fake-token';
    const data = { sync: 'true' };

    const messageId = await service.sendSilentPush(token, data);

    expect(admin.messaging().send).toHaveBeenCalledWith(expect.objectContaining({
      token,
      data,
      // Should NOT have notification block
    }));
    // Check absence of notification property in the call argument
    const callArgs = (admin.messaging().send as jest.Mock).mock.calls[1][0]; // 0 is previous test
    expect(callArgs.notification).toBeUndefined();
  });

  it('should subscribe to topic', async () => {
    const tokens = ['token1', 'token2'];
    const topic = 'class_10';

    const response = await service.subscribeToTopic(tokens, topic);

    expect(admin.messaging().subscribeToTopic).toHaveBeenCalledWith(tokens, topic);
    expect(response.successCount).toBe(1);
  });

  it('should send a push notification with image', async () => {
    const token = 'fake-token';
    const title = 'Hello';
    const body = 'World';
    const data = { key: 'value' };
    const imageUrl = 'http://example.com/image.png';

    const messageId = await service.sendPush(token, title, body, data, imageUrl);

    expect(admin.messaging().send).toHaveBeenCalledWith(expect.objectContaining({
      notification: { title, body, imageUrl },
      android: expect.objectContaining({ notification: expect.objectContaining({ imageUrl }) }),
      apns: expect.objectContaining({ fcmOptions: { image: imageUrl } }),
    }));
  });

  it('should send a push notification to topic', async () => {
    const topic = 'news';
    const title = 'Hello';
    const body = 'World';

    const messageId = await service.sendPushToTopic(topic, title, body);

    expect(admin.messaging().send).toHaveBeenCalledWith(expect.objectContaining({
      topic,
      notification: { title, body },
    }));
  });
});
