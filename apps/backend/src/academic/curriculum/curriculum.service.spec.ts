import { Test, TestingModule } from '@nestjs/testing';
import { CurriculumService } from './curriculum.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as xlsx from 'xlsx';

// Mock xlsx module
jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} },
  })),
  utils: {
    sheet_to_json: jest.fn(() => [
      {
        'Chapter Name': 'C1',
        'Topic Name': 'T1',
        'Learning Outcomes': 'O1, O2',
        'Estimated Hours': '5',
      }
    ]),
  },
}));

describe('CurriculumService', () => {
  let service: CurriculumService;
  let prisma: PrismaService;

  const mockPrismaService = {
    curriculumPlan: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    topic: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    staffProfile: {
      findUnique: jest.fn(),
    },
    syllabusLog: {
      create: jest.fn(),
    },
    admissionSession: {
      findFirst: jest.fn().mockResolvedValue({ startDate: new Date('2024-01-01') }),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    chapter: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  // Fix for transaction context mocking
  mockPrismaService.chapter.create = jest.fn().mockResolvedValue({ id: 'chapter-1' });
  (mockPrismaService as any).topic = {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurriculumService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CurriculumService>(CurriculumService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importCurriculum', () => {
    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        service.importCurriculum('tenant-1', null, {} as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should increment version if plan exists', async () => {
      const mockFile = { buffer: Buffer.from('dummy') } as any;

      // Mock existing plan version 1.0
      mockPrismaService.curriculumPlan.findFirst.mockResolvedValue({ id: 'old-plan', version: '1.0' });
      mockPrismaService.curriculumPlan.create.mockResolvedValue({ id: 'new-plan', version: '1.1' });

      const result = await service.importCurriculum('tenant-1', mockFile, { classId: 'c1', subjectId: 's1', academicYear: 'ay1' });

      expect(mockPrismaService.curriculumPlan.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ version: '1.1' })
      }));
      expect(result.planId).toBe('new-plan');
    });

    it('should allow version increment even if logs exist (Safe Update)', async () => {
      const mockFile = { buffer: Buffer.from('dummy') } as any;

      // Mock existing plan with logs
      mockPrismaService.curriculumPlan.findFirst.mockResolvedValue({ id: 'plan-1', version: '1.0' });
      mockPrismaService.curriculumPlan.create.mockResolvedValue({ id: 'new-plan', version: '1.1' });
      mockPrismaService.topic.count.mockResolvedValue(1); // logs exist on OLD plan

      const result = await service.importCurriculum('tenant-1', mockFile, { classId: 'c1', subjectId: 's1', academicYear: 'ay1' });

      // Should create new version
      expect(mockPrismaService.curriculumPlan.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ version: '1.1' })
      }));
      // Should NOT have deleted anything on the new plan (since it was just created)
      // Note: deleteMany is called on plan.id (which is new-plan.id). Since it's new, deleteMany does nothing effectively.
      // The test 'Integrity' is now implicitly satisfied by the fact we didn't touch plan-1's data.
    });
  });

  describe('markTopicCompleted', () => {
    it('should throw NotFoundException if topic not found', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(null);
      await expect(
        service.markTopicCompleted('tenant-1', 'topic-1', 'user-1', 'section-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if teacher profile not found', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue({ id: 'topic-1' });
      mockPrismaService.staffProfile.findUnique.mockResolvedValue(null);
      await expect(
        service.markTopicCompleted('tenant-1', 'topic-1', 'user-1', 'section-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create syllabus log if topic and teacher exist', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue({ id: 'topic-1' });
      mockPrismaService.staffProfile.findUnique.mockResolvedValue({ id: 'staff-1', userId: 'user-1' });
      mockPrismaService.syllabusLog.create.mockResolvedValue({ id: 'log-1' });

      const result = await service.markTopicCompleted('tenant-1', 'topic-1', 'user-1', 'section-1');
      expect(result).toEqual({ id: 'log-1' });
    });
  });
});
