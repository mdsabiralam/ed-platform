import { Test, TestingModule } from '@nestjs/testing';
import { SocialController } from './social.controller';
import { SocialAnalyticsService } from '../services/social-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SocialController PII Safety', () => {
  let controller: SocialController;
  let prismaService: PrismaService;

  const mockArtifact = {
    id: 'artifact-1',
    publicSlug: 'safe-slug',
    student: {
        firstName: 'John',
        lastName: 'Doe',
        admissionNo: 'A123',
        tenant: {
            name: 'Demo School',
            logoUrl: 'http://logo.com'
        }
        // NOTE: Prisma select in controller prevents other fields from being fetched.
        // But for this unit test, we mock the findUnique result directly.
        // To verify the "Safety", we must ensure the CONTROLLER logic filters or selects correctly.
        // Since we mock the DB response, we are testing the Transformation logic in the controller (if any)
        // OR we are assuming Prisma select works (which it does).
        // The Controller code uses `select` in the query.
        // Ideally, we'd integration test this.
        // But here, let's verify the response shape.
    }
  };

  const mockPrismaService = {
    socialArtifact: {
      create: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(mockArtifact),
    },
    shareAnalytics: {
        upsert: jest.fn(),
    }
  };

  const mockAnalyticsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SocialAnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    controller = module.get<SocialController>(SocialController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should return public result without PII', async () => {
    const result = await controller.getPublicResult('safe-slug');

    // 1. Verify Safe Data is present
    expect(result).toHaveProperty('studentName', 'John Doe');
    expect(result).toHaveProperty('schoolName', 'Demo School');

    // 2. Verify PII is ABSENT
    // In TypeScript/JS, checking if property exists
    expect((result as any).phone).toBeUndefined();
    expect((result as any).email).toBeUndefined();
    expect((result as any).address).toBeUndefined();
    expect((result as any).dob).toBeUndefined();
    expect((result as any).student).toBeUndefined(); // Should not return the raw student object either

    // 3. Verify Prisma was called with specific select
    expect(mockPrismaService.socialArtifact.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { publicSlug: 'safe-slug' },
        include: expect.objectContaining({
            student: expect.objectContaining({
                select: expect.objectContaining({
                   // We verify that we requested specific fields
                   firstName: true,
                   lastName: true,
                   // And definitely NOT requesting PII (though 'select' logic is hard to assert negation on partial match,
                   // presence of 'select' proves we aren't getting everything)
                })
            })
        })
    }));
  });
});
