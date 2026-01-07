import { Test, TestingModule } from '@nestjs/testing';
import { GuardianService } from './guardian.service';
import { PrismaService } from '../prisma/prisma.service';
import { RelationshipType } from '@prisma/client';

describe('GuardianService', () => {
  let service: GuardianService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuardianService,
        {
          provide: PrismaService,
          useValue: {
            student: { findUnique: jest.fn() },
            user: { findFirst: jest.fn(), create: jest.fn() },
            guardian: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
            parentStudentMapping: { findUnique: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<GuardianService>(GuardianService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGuardianForStudent', () => {
    it('should link to existing guardian if user and guardian exist (Sibling Logic)', async () => {
      // Mock existing student
      (prisma.student.findUnique as jest.Mock).mockResolvedValue({ id: 's2', tenantId: 't1' });

      // Mock existing user with guardian
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'u1',
        guardian: { id: 'g1' },
      });

      // Mock mapping does not exist
      (prisma.parentStudentMapping.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.parentStudentMapping.findFirst as jest.Mock).mockResolvedValue(null); // No primary contact yet

      await service.createGuardianForStudent('s2', {
        phone: '123',
        fullName: 'Dad',
        relationshipType: RelationshipType.FATHER,
      });

      // Expect no new user/guardian creation
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.guardian.create).not.toHaveBeenCalled();

      // Expect mapping creation with existing guardian ID
      expect(prisma.parentStudentMapping.create).toHaveBeenCalledWith({
        data: {
          studentId: 's2',
          guardianId: 'g1',
          relationshipType: RelationshipType.FATHER,
          isPrimaryContact: true,
        },
      });
    });

    it('should create guardian for existing user if guardian profile missing', async () => {
      (prisma.student.findUnique as jest.Mock).mockResolvedValue({ id: 's1', tenantId: 't1' });

      // Mock existing user WITHOUT guardian
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'u1',
        guardian: null,
      });

      (prisma.guardian.create as jest.Mock).mockResolvedValue({ id: 'gNew' });
      (prisma.parentStudentMapping.findUnique as jest.Mock).mockResolvedValue(null);

      await service.createGuardianForStudent('s1', {
        phone: '123',
        fullName: 'Dad',
        relationshipType: RelationshipType.FATHER,
        occupation: 'Worker',
        annualIncome: 50000,
      });

      expect(prisma.guardian.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          fullName: 'Dad',
          occupation: 'Worker',
          annualIncome: 50000,
          relationship: 'FATHER',
        },
      });

      expect(prisma.parentStudentMapping.create).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ guardianId: 'gNew' })
      }));
    });

    it('should create new user and guardian if user does not exist', async () => {
        (prisma.student.findUnique as jest.Mock).mockResolvedValue({ id: 's1', tenantId: 't1' });
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null); // No user

        (prisma.user.create as jest.Mock).mockResolvedValue({
            id: 'uNew',
            guardian: { id: 'gNew' }
        });
        (prisma.parentStudentMapping.findUnique as jest.Mock).mockResolvedValue(null);

        await service.createGuardianForStudent('s1', {
            phone: '999',
            fullName: 'Mom',
            relationshipType: RelationshipType.MOTHER,
        });

        expect(prisma.user.create).toHaveBeenCalled();
        expect(prisma.parentStudentMapping.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ guardianId: 'gNew' })
        }));
    });
  });
});
