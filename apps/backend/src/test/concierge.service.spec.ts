import { Test, TestingModule } from '@nestjs/testing';
import { ConciergeService } from '../concierge/concierge.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { CreateConciergeRequestDto } from '../concierge/dto/create-concierge-request.dto';
import { RequestStatus } from '@prisma/client';

describe('ConciergeService', () => {
  let service: ConciergeService;
  let prisma: PrismaService;
  let cls: ClsService;

  const mockPrisma = {
    staffProfile: {
      findUnique: jest.fn(),
    },
    conciergeRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCls = {
    get: jest.fn().mockReturnValue('mock-school-id'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConciergeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ClsService, useValue: mockCls },
      ],
    }).compile();

    service = module.get<ConciergeService>(ConciergeService);
    prisma = module.get<PrismaService>(PrismaService);
    cls = module.get<ClsService>(ClsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a request', async () => {
      const dto: CreateConciergeRequestDto = {
        rawImageUrl: 'http://test.com/image.jpg',
        instructionText: 'Test instructions',
      };
      const teacherUserId = 'teacher-1';
      const mockStaffProfile = { id: 'staff-1', userId: teacherUserId };

      mockPrisma.staffProfile.findUnique.mockResolvedValue(mockStaffProfile);
      mockPrisma.conciergeRequest.create.mockResolvedValue({
        id: 'req-1',
        ...dto,
        teacherId: mockStaffProfile.id,
        instituteId: 'mock-school-id',
        status: RequestStatus.PENDING,
      });

      const result = await service.create(dto, teacherUserId);

      expect(prisma.staffProfile.findUnique).toHaveBeenCalledWith({ where: { userId: teacherUserId } });
      expect(prisma.conciergeRequest.create).toHaveBeenCalledWith({
        data: {
          instituteId: 'mock-school-id',
          teacherId: 'staff-1',
          ...dto,
        },
      });
      expect(result).toEqual(expect.objectContaining({ id: 'req-1' }));
    });
  });

  describe('findAll', () => {
    it('should return all requests for the institute', async () => {
        mockPrisma.conciergeRequest.findMany.mockResolvedValue([]);
        await service.findAll();
        expect(prisma.conciergeRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { instituteId: 'mock-school-id' }
        }));
    });
  });
});
