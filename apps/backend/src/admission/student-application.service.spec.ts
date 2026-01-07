import { Test, TestingModule } from '@nestjs/testing';
import { StudentApplicationService } from './student-application.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock PrismaService
const mockPrismaService = {
  studentApplication: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  admissionSequence: {
    upsert: jest.fn(),
  },
};

describe('StudentApplicationService', () => {
  let service: StudentApplicationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentApplicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StudentApplicationService>(StudentApplicationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // 4.B.10 Write a test case to verify JSONB storage.
  it('should store and retrieve JSONB data (previous school history) correctly', async () => {
    const tenantId = 'tenant-1';
    const dto = {
      school_id: tenantId,
      class_id: 'class-1',
      personal_details: { name: 'Test Student' },
      previous_school_history: [
        { schoolName: 'School A', address: 'Address 1' },
        { schoolName: 'School B', address: 'Address 2' },
        { schoolName: 'School C', address: 'Address 3' },
      ],
      status: 'Draft' as const,
    };

    // Mock serial number generation
    (prisma.admissionSequence.upsert as jest.Mock).mockResolvedValue({
        lastSeq: 1
    });

    (prisma.studentApplication.findFirst as jest.Mock).mockResolvedValue(null);

    // Mock create to return what we passed to verify it was called with correct JSON
    (prisma.studentApplication.create as jest.Mock).mockImplementation((args) => {
        return Promise.resolve({
            id: 'app-id-1',
            ...args.data,
        });
    });

    const result = await service.apply(dto);

    expect(prisma.studentApplication.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        previousSchoolHistory: expect.arrayContaining([
            expect.objectContaining({ schoolName: 'School A' }),
            expect.objectContaining({ schoolName: 'School B' }),
            expect.objectContaining({ schoolName: 'School C' }),
        ]),
      }),
    });

    expect(result.previousSchoolHistory).toHaveLength(3);
    expect(result.previousSchoolHistory[0].schoolName).toBe('School A');
  });
});
