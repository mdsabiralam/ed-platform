import { Test, TestingModule } from '@nestjs/testing';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue({
      addPage: jest.fn().mockReturnValue({
        getSize: jest.fn().mockReturnValue({ width: 600, height: 400 }),
        drawText: jest.fn(),
      }),
      embedFont: jest.fn(),
      save: jest.fn().mockResolvedValue(new Uint8Array([])),
    }),
  },
  StandardFonts: { Helvetica: 'Helvetica' },
  rgb: jest.fn(),
}));

describe('TrainingModule', () => {
  let controller: TrainingController;
  let service: TrainingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    teacherTraining: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    trainingAttendance: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    serviceBook: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingController],
      providers: [
        TrainingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<TrainingController>(TrainingController);
    service = module.get<TrainingService>(TrainingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a training session', async () => {
      const dto = {
        title: 'Test Training',
        description: 'Test Description',
        date: '2025-12-25T10:00:00Z',
        durationHours: 2,
        resourcePerson: 'Dr. Test',
        resourceUrls: ['http://test.com'],
        schoolId: 'school-123',
      };

      const expectedResult = { id: 'uuid', ...dto, date: new Date(dto.date), tenantId: dto.schoolId };
      mockPrismaService.teacherTraining.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(prisma.teacherTraining.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          date: new Date(dto.date),
          durationHours: dto.durationHours,
          resourcePerson: dto.resourcePerson,
          resourceUrls: dto.resourceUrls,
          tenantId: dto.schoolId,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming trainings filtered by schoolId', async () => {
      const schoolId = 'school-123';
      const mockTrainings = [
        { id: '1', title: 'Future Training', date: new Date('2026-01-01'), tenantId: schoolId },
      ];

      mockPrismaService.teacherTraining.findMany.mockResolvedValue(mockTrainings);

      const result = await controller.getUpcoming(schoolId);

      expect(prisma.teacherTraining.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: schoolId,
          date: { gt: expect.any(Date) },
        },
        orderBy: { date: 'asc' },
      });
      expect(result).toEqual(mockTrainings);
    });

    it('should throw BadRequestException if schoolId is missing', async () => {
        await expect(controller.getUpcoming('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitFeedback', () => {
    it('should update feedback for existing attendance', async () => {
      const dto = { attendanceId: 'att-1', score: 5, comments: 'Great!' };
      const mockAttendance = { id: 'att-1' };

      mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrismaService.trainingAttendance.update.mockResolvedValue({ ...mockAttendance, feedbackScore: 5 });

      await controller.submitFeedback(dto);

      expect(prisma.trainingAttendance.findUnique).toHaveBeenCalledWith({ where: { id: dto.attendanceId } });
      expect(prisma.trainingAttendance.update).toHaveBeenCalledWith({
        where: { id: dto.attendanceId },
        data: { feedbackScore: dto.score, feedbackComments: dto.comments },
      });
    });

    it('should throw NotFoundException if attendance record missing', async () => {
       const dto = { attendanceId: 'att-2', score: 5 };
       mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(null);

       await expect(controller.submitFeedback(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAttendance', () => {
    it('should update status and create ServiceBook entry if PRESENT', async () => {
      const attendanceId = 'att-1';
      const status = 'PRESENT';
      const mockTraining = {
         title: 'Training 1',
         date: new Date(),
         durationHours: 4,
         tenantId: 'school-1'
      };
      const mockAttendance = {
         id: attendanceId,
         staffId: 'staff-1',
         training: mockTraining
      };

      mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrismaService.trainingAttendance.update.mockResolvedValue({ ...mockAttendance, status });
      mockPrismaService.serviceBook.findFirst.mockResolvedValue(null);

      await controller.markAttendance(attendanceId, { status } as any);

      expect(prisma.trainingAttendance.update).toHaveBeenCalledWith({
        where: { id: attendanceId },
        data: { status },
      });
      expect(prisma.serviceBook.create).toHaveBeenCalledWith({
        data: {
          staffId: mockAttendance.staffId,
          tenantId: mockTraining.tenantId,
          entryType: 'Professional Development',
          description: `Attended Training: ${mockTraining.title}`,
          date: mockTraining.date,
          durationHours: mockTraining.durationHours,
        },
      });
    });

    it('should NOT create ServiceBook entry if it already exists', async () => {
      const attendanceId = 'att-1';
      const status = 'PRESENT';
      const mockAttendance = {
         id: attendanceId,
         staffId: 'staff-1',
         training: { title: 'T1', date: new Date(), tenantId: 's1', durationHours: 1 }
      };

      mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrismaService.trainingAttendance.update.mockResolvedValue({ ...mockAttendance, status });
      mockPrismaService.serviceBook.findFirst.mockResolvedValue({ id: 'sb-1' });

      await controller.markAttendance(attendanceId, { status } as any);

      expect(prisma.serviceBook.create).not.toHaveBeenCalled();
    });

    it('should update status but NOT create ServiceBook entry if ABSENT', async () => {
      const attendanceId = 'att-1';
      const status = 'ABSENT';
      const mockAttendance = {
         id: attendanceId,
         staffId: 'staff-1',
         training: { title: 'T1' }
      };

      mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrismaService.trainingAttendance.update.mockResolvedValue({ ...mockAttendance, status });

      await controller.markAttendance(attendanceId, { status } as any);

      expect(prisma.trainingAttendance.update).toHaveBeenCalled();
      expect(prisma.serviceBook.create).not.toHaveBeenCalled();
    });
  });

  describe('uploadResource', () => {
    it('should save file and update resourceUrls', async () => {
      const trainingId = 't-1';
      const file = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
      } as any;

      mockPrismaService.teacherTraining.findUnique.mockResolvedValue({ id: trainingId });
      mockPrismaService.teacherTraining.update.mockResolvedValue({ id: trainingId, resourceUrls: ['/uploads/training/timestamp-test.pdf'] });

      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await controller.uploadResource(trainingId, file);

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(prisma.teacherTraining.update).toHaveBeenCalledWith({
        where: { id: trainingId },
        data: { resourceUrls: { push: expect.stringContaining('.pdf') } }
      });
    });
  });

  describe('generateTrainingCertificate', () => {
    it('should generate PDF and update certificateUrl', async () => {
      const attendanceId = 'att-1';
      const mockAttendance = {
        id: attendanceId,
        status: 'PRESENT',
        training: { title: 'Training 1', date: new Date() },
        staff: { user: { firstName: 'John', lastName: 'Doe' } }
      };

      mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrismaService.trainingAttendance.update.mockResolvedValue({ ...mockAttendance, certificateUrl: '/uploads/certificates/cert.pdf' });

      await controller.generateCertificate(attendanceId);

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(prisma.trainingAttendance.update).toHaveBeenCalledWith({
        where: { id: attendanceId },
        data: { certificateUrl: expect.stringContaining('.pdf') }
      });
    });

    it('should throw BadRequest if status is not PRESENT', async () => {
        const attendanceId = 'att-2';
        mockPrismaService.trainingAttendance.findUnique.mockResolvedValue({ id: attendanceId, status: 'ABSENT' });

        await expect(controller.generateCertificate(attendanceId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAbsenteeismAnalytics', () => {
    it('should return staff with > 50% absenteeism', async () => {
      const schoolId = 's-1';
      const mockAttendances = [
        { staffId: 'st-1', status: 'ABSENT', staff: { user: { firstName: 'A', lastName: 'B' } } },
        { staffId: 'st-1', status: 'ABSENT', staff: { user: { firstName: 'A', lastName: 'B' } } }, // 2/2 = 100%
        { staffId: 'st-2', status: 'PRESENT', staff: { user: { firstName: 'C', lastName: 'D' } } },
        { staffId: 'st-2', status: 'ABSENT', staff: { user: { firstName: 'C', lastName: 'D' } } }, // 1/2 = 50% (not > 50%)
        { staffId: 'st-3', status: 'PRESENT', staff: { user: { firstName: 'E', lastName: 'F' } } }, // 0/1 = 0%
      ];

      mockPrismaService.trainingAttendance.findMany.mockResolvedValue(mockAttendances);

      const result = await controller.getAbsenteeismAnalytics(schoolId);

      expect(prisma.trainingAttendance.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].staffId).toBe('st-1');
      expect(result[0].absenteeismRate).toBe(1);
    });
  });

  describe('getAttendanceDetails (RLS)', () => {
    it('should return attendance if userId matches', async () => {
      const attendanceId = 'att-1';
      const userId = 'user-1';
      const mockAttendance = {
        id: attendanceId,
        staff: { userId: userId },
      };

      mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(mockAttendance);

      const result = await controller.getAttendance(attendanceId, userId);
      expect(result).toEqual(mockAttendance);
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      const attendanceId = 'att-1';
      const userId = 'user-1';
      const otherUser = 'user-2';
      const mockAttendance = {
        id: attendanceId,
        staff: { userId: otherUser },
      };

      mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(mockAttendance);

      await expect(controller.getAttendance(attendanceId, userId))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
