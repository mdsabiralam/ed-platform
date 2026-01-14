import { Test, TestingModule } from '@nestjs/testing';
import { SocialService } from './social.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PII Safety Test', () => {
  let service: SocialService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        {
          provide: PrismaService,
          useValue: {
            socialArtifact: {
              findUnique: jest.fn(),
            },
            shareAnalytics: {
              upsert: jest.fn(),
            },
            resultSummary: {
              findMany: jest.fn(),
            }
          },
        },
      ],
    }).compile();

    service = module.get<SocialService>(SocialService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('6.I.10: Should strictly exclude PII from public artifact response', async () => {
    // Mock data with sensitive fields
    const sensitiveStudentData = {
      id: 'student-123',
      firstName: 'Rahul',
      lastName: 'Sharma', // Sensitive (Full name masked?) Requirement says "Full Last Name" not rendered, usually allows Initial or just First. Logic returns only first.
      email: 'rahul@example.com', // SENSITIVE
      phone: '+919876543210', // SENSITIVE
      dob: new Date('2005-01-01'), // SENSITIVE
      address: '123 Main St', // SENSITIVE
      tenant: { name: 'Springfield High' },
      section: { class: { name: '10-A' } }
    };

    const mockArtifact = {
      id: 'artifact-1',
      publicSlug: 'xyz123',
      expiresAt: new Date(Date.now() + 1000000),
      student: sensitiveStudentData,
      metadata: { examId: 'exam-1' }
    };

    (prisma.socialArtifact.findUnique as jest.Mock).mockResolvedValue(mockArtifact);
    (prisma as any).resultSummary.findMany.mockResolvedValue([]); // No results for simplicity

    const result = await service.getPublicArtifact('xyz123');

    // Verification
    expect(result).toBeDefined();

    // Allowed fields
    expect(result.firstName).toBe('Rahul');
    expect(result.schoolName).toBe('Springfield High');
    expect(result.className).toBe('10-A');

    // Forbidden fields (PII)
    expect((result as any).email).toBeUndefined();
    expect((result as any).phone).toBeUndefined();
    expect((result as any).dob).toBeUndefined();
    expect((result as any).address).toBeUndefined();
    expect((result as any).lastName).toBeUndefined(); // Checking if last name is leaked

    // Type check assurance
    const keys = Object.keys(result);
    const allowedKeys = ['firstName', 'className', 'schoolName', 'rank', 'percentage'];
    const unexpectedKeys = keys.filter(k => !allowedKeys.includes(k));

    expect(unexpectedKeys).toEqual([]);
  });
});
