import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import RedisMock from 'ioredis-mock';
import { PrismaServiceMock } from './mocks/prisma.service.mock';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

describe('Brute Force Protection (e2e)', () => {
  let app: INestApplication;
  let redisMock: any;

  beforeAll(async () => {
    redisMock = new RedisMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('REDIS_CLIENT')
    .useValue(redisMock)
    .overrideProvider(PrismaService)
    .useValue(PrismaServiceMock)
    .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow 5 login attempts and then block with 429', async () => {
    const email = 'target@example.com';
    const password = 'wrong-password';

    PrismaServiceMock.user.findUnique.mockResolvedValue(null);

    const server = app.getHttpServer();

    let unauthorizedCount = 0;
    let tooManyRequestsCount = 0;

    // Run 20 requests as per requirement (5 allow, 15 block)
    for (let i = 0; i < 20; i++) {
        try {
            const res = await request(server)
                .post('/auth/login')
                .send({ email, password });

            if (res.status === 401) unauthorizedCount++;
            if (res.status === 429) tooManyRequestsCount++;
        } catch (error) {
            console.log('Request failed', error.message);
        }
    }

    console.log(`401 Count: ${unauthorizedCount}`);
    console.log(`429 Count: ${tooManyRequestsCount}`);

    // Assert exact counts
    expect(unauthorizedCount).toBe(5);
    expect(tooManyRequestsCount).toBe(15);
  });
});
