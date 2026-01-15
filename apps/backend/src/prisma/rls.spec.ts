import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { ClsService } from 'nestjs-cls';
import { PrismaModule } from './prisma.module';
import { ClsModule } from 'nestjs-cls';

describe('RLS Verification', () => {
  let prisma: PrismaService;
  let cls: ClsService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: { mount: true },
        }),
        PrismaModule,
      ],
    }).compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    cls = moduleRef.get<ClsService>(ClsService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should prevent Institute A from accessing data of Institute B', async () => {
    // Note: This test requires a running DB. If unavailable, we skip execution logic but verify structure.
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dummy')) {
      console.warn('Skipping RLS integration test due to missing database.');
      return;
    }

    // 1. Create two dummy institutes
    const instituteA = await prisma.institute.create({
      data: { name: 'Institute A', subdomain: `inst-a-${Date.now()}` },
    });
    const instituteB = await prisma.institute.create({
      data: { name: 'Institute B', subdomain: `inst-b-${Date.now()}` },
    });

    // 2. Create data for Institute B (Simulate context B)
    let studentBId: string;
    await cls.runWith({ instituteId: instituteB.id }, async () => {
      // Create Student B
      // Note: Student requires relations like AdmissionSession, Section, etc.
      // For simplicity, we might test with a simpler model like ChartOfAccount or creating dependencies.
      // Let's create a minimal ChartOfAccount which is scoped.
      const acc = await prisma.chartOfAccount.create({
        data: {
          code: `1001-${Date.now()}`,
          name: 'Cash B',
          type: 'ASSET',
          // instituteId is auto-injected by our middleware!
        } as any, // casting because type expects instituteId but we want middleware to do it
      });
      studentBId = acc.id;

      // Verify it has instituteId B
      expect(acc.instituteId).toBe(instituteB.id);
    });

    // 3. Simulate request context for 'Institute A' and query B's data
    await cls.runWith({ instituteId: instituteA.id }, async () => {
      // Try to find All ChartOfAccounts
      const accounts = await prisma.chartOfAccount.findMany();

      // Assert: Should NOT find the account from B
      const foundB = accounts.find(a => a.id === studentBId);
      expect(foundB).toBeUndefined();

      // Try to find specific ID
      const specific = await prisma.chartOfAccount.findUnique({
        where: { id: studentBId } as any, // casting due to composite unique potentially?
        // chartOfAccount is @@unique([instituteId, code]) but also has @id default uuid
        // findUnique usually requires the @id or @@unique fields.
        // Our middleware converts findUnique -> findFirst to inject filter.
      });
      expect(specific).toBeNull();

      // Verify we can create data for A
      const accA = await prisma.chartOfAccount.create({
        data: {
          code: `1001-${Date.now()}`,
          name: 'Cash A',
          type: 'ASSET',
        } as any,
      });
      expect(accA.instituteId).toBe(instituteA.id);
    });

    // Cleanup
    // We need to bypass RLS to clean up or use contexts
    await cls.runWith({ instituteId: instituteA.id }, async () => {
        await prisma.chartOfAccount.deleteMany();
    });
    await cls.runWith({ instituteId: instituteB.id }, async () => {
        await prisma.chartOfAccount.deleteMany();
    });
    await prisma.institute.delete({ where: { id: instituteA.id } });
    await prisma.institute.delete({ where: { id: instituteB.id } });
  });
});
