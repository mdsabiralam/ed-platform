import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Notice Visibility (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should filter notices based on target audience', async () => {
    // Setup Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test School',
        subdomain: 'test-notice-' + Date.now(),
      }
    });

    // Setup Classes
    const class5 = await prisma.class.create({
      data: { name: 'Class 5', tenantId: tenant.id }
    });
    const section5 = await prisma.section.create({
      data: { name: 'A', classId: class5.id }
    });

    const class6 = await prisma.class.create({
      data: { name: 'Class 6', tenantId: tenant.id }
    });
    const section6 = await prisma.section.create({
      data: { name: 'A', classId: class6.id }
    });

    // Setup Session
    const session = await prisma.admissionSession.create({
      data: {
        name: '2024',
        startDate: new Date(),
        endDate: new Date(Date.now() + 100000),
        tenantId: tenant.id
      }
    });

    // Setup Users (Parents/Students)
    // Parent 5
    const parent5 = await prisma.user.create({
      data: {
        email: `parent5-${Date.now()}@test.com`,
        passwordHash: 'hash',
        profiles: { create: { tenantId: tenant.id, role: 'PARENT' } },
        student: {
          create: {
            tenantId: tenant.id,
            firstName: 'Student5',
            lastName: 'Test',
            admissionNo: 'A1-' + Date.now(),
            admissionSessionId: session.id,
            sectionId: section5.id
          }
        }
      }
    });

    // Parent 6
    const parent6 = await prisma.user.create({
      data: {
        email: `parent6-${Date.now()}@test.com`,
        passwordHash: 'hash',
        profiles: { create: { tenantId: tenant.id, role: 'PARENT' } },
        student: {
          create: {
            tenantId: tenant.id,
            firstName: 'Student6',
            lastName: 'Test',
            admissionNo: 'A2-' + Date.now(),
            admissionSessionId: session.id,
            sectionId: section6.id
          }
        }
      }
    });

    // 1. Create Notice for Class 5
    const notice = await prisma.notice.create({
       data: {
         title: 'Class 5 Only',
         content: 'Secret',
         expiryDate: new Date(Date.now() + 100000),
         targetAudience: { classId: class5.id },
         tenantId: tenant.id,
         authorId: parent5.id, // Using parent as author for simplicity, though usually admin
         publishedAt: new Date()
       }
    });

    // 2. Authenticate as 'Class 6' Parent (Header-based mock auth)
    const response6 = await request(app.getHttpServer())
      .get('/api/communication/notices')
      .set('x-user-id', parent6.id)
      .set('x-tenant-id', tenant.id)
      .expect(200);

    // 4. Assert that the specific notice is NOT present
    const notices6 = response6.body;
    expect(notices6.find((n: any) => n.id === notice.id)).toBeUndefined();

    // 5. Authenticate as 'Class 5' Parent
    const response5 = await request(app.getHttpServer())
      .get('/api/communication/notices')
      .set('x-user-id', parent5.id)
      .set('x-tenant-id', tenant.id)
      .expect(200);

    // Assert that it IS present
    const notices5 = response5.body;
    expect(notices5.find((n: any) => n.id === notice.id)).toBeDefined();

    // Cleanup
    await prisma.notice.delete({ where: { id: notice.id } });
    await prisma.student.deleteMany({ where: { OR: [{ userId: parent5.id }, { userId: parent6.id }] } });
    await prisma.profile.deleteMany({ where: { OR: [{ userId: parent5.id }, { userId: parent6.id }] } });
    await prisma.user.deleteMany({ where: { OR: [{ id: parent5.id }, { id: parent6.id }] } });
    await prisma.section.deleteMany({ where: { OR: [{ id: section5.id }, { id: section6.id }] } });
    await prisma.class.deleteMany({ where: { OR: [{ id: class5.id }, { id: class6.id }] } });
    await prisma.admissionSession.delete({ where: { id: session.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
  });
});
