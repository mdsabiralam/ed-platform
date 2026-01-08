import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Security: SQL Injection Vulnerability Test (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should prevent SQL injection in input parameters via ValidationPipe', async () => {
    // Attempt to inject SQL into the subdomain field
    // The DTO validation (@Matches) should catch this before it even reaches the DB.
    
    const maliciousSubdomain = "' OR '1'='1";
    
    const response = await request(app.getHttpServer())
      .post('/tenants')
      .send({
        name: 'Hacker School',
        subdomain: maliciousSubdomain, 
      });

    // Expect 400 Bad Request due to validation failure.
    // This confirms that malformed inputs are rejected early.
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining(['Subdomain must be lowercase alphanumeric with hyphens'])
    );
  });

  it('should treat SQL injection strings as literals in direct DB queries via Prisma', async () => {
    // Even if validation is bypassed, Prisma should treat input as literal string
    const maliciousInput = "admin' --";
    
    // This finds a user with email exactly equal to "admin' --"
    // It does NOT execute the comment (--) or alter the query logic.
    const user = await prisma.user.findUnique({
      where: { email: maliciousInput },
    });

    expect(user).toBeNull();
  });
});
