import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('Broadcast Engine (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Mock Queue
  const mockQueue = {
    addBulk: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(getQueueToken('broadcast_queue'))
    .useValue(mockQueue)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Setup Test Data
    // 1. Create User
    await prisma.user.create({
      data: {
        id: 'mock-user-1',
        email: 'test@example.com',
        phone: '1234567890',
        passwordHash: 'hash',
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.broadcastLog.deleteMany();
    await prisma.broadcastCampaign.deleteMany();
    await prisma.user.deleteMany({ where: { id: 'mock-user-1' } });
    await app.close();
  });

  it('/api/communication/send-bulk (POST) - Create Campaign', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/communication/send-bulk')
      .send({
        title: 'Test Campaign',
        messageBody: 'Hello {{name}}',
        channel: 'SMS',
        targetFilter: { defaultersOnly: false }
      })
      .expect(201);

    expect(response.body.campaignId).toBeDefined();
    expect(response.body.status).toBe('PROCESSING');

    // Verify jobs were added to queue
    expect(mockQueue.addBulk).toHaveBeenCalled();
  });

  it('/api/communication/estimate-cost (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/communication/estimate-cost')
      .send({
        messageBody: 'Test Message',
        channel: 'SMS',
        targetFilter: {}
      })
      .expect(201);

    expect(response.body.estimatedCost).toBeDefined();
  });
});
