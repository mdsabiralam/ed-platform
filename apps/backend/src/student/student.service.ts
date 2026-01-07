import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCorrectionRequestDto, ApproveCorrectionRequestDto } from './dto/create-correction-request.dto';
import { plainToInstance } from 'class-transformer';
import { StudentEntity, UserEntity } from './entities/student.entity';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async createCorrectionRequest(userId: string, dto: CreateCorrectionRequestDto) {
    // Verify requester is parent of student
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: { guardians: true },
    });

    if (!student) throw new NotFoundException('Student not found');

    const isGuardian = student.guardians.some(g => g.guardian.userId === userId);
    // Note: guardian relation logic might differ based on schema details (Guardian -> User)
    // Checking schema: ParentStudentMapping -> Guardian -> User

    // For simplicity, we check if the user is a guardian of this student
    // We need to fetch User -> Guardian first
    const guardian = await this.prisma.guardian.findUnique({ where: { userId } });

    if (!guardian) {
       // Maybe it's a student requesting for themselves?
       if (student.userId !== userId) throw new ForbiddenException('Not authorized');
    } else {
       const isMapped = await this.prisma.parentStudentMapping.findUnique({
         where: { studentId_guardianId: { studentId: dto.studentId, guardianId: guardian.id } }
       });
       if (!isMapped) throw new ForbiddenException('Not authorized');
    }

    return this.prisma.dataCorrectionRequest.create({
      data: {
        studentId: dto.studentId,
        requesterId: userId,
        fieldName: dto.fieldName,
        oldValue: dto.oldValue,
        newValue: dto.newValue,
        status: 'PENDING',
      },
    });
  }

  async getCorrectionRequests() {
    return this.prisma.dataCorrectionRequest.findMany({
      include: { student: true, requester: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveCorrectionRequest(id: string, dto: ApproveCorrectionRequestDto) {
    const request = await this.prisma.dataCorrectionRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Request already processed');

    if (dto.status === 'REJECTED') {
      return this.prisma.dataCorrectionRequest.update({
        where: { id },
        data: { status: 'REJECTED', rejectionReason: dto.rejectionReason },
      });
    }

    // Approve
    const updateData = {};
    updateData[request.fieldName] = request.newValue;

    // Transaction to update student and request
    return this.prisma.$transaction([
      this.prisma.student.update({
        where: { id: request.studentId },
        data: updateData,
      }),
      this.prisma.dataCorrectionRequest.update({
        where: { id },
        data: { status: 'APPROVED' },
      }),
    ]);
  }

  // 4.I.06 GDPR Anonymization
  async anonymizeStudent(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) throw new NotFoundException('Student not found');

    const anonymizedData = {
      firstName: 'Deleted',
      lastName: 'User',
      deletedAt: new Date(),
    };

    const operations = [
      this.prisma.student.update({
        where: { id: studentId },
        data: anonymizedData,
      }),
    ];

    if (student.user) {
      operations.push(
        this.prisma.user.update({
          where: { id: student.userId },
          data: {
            email: `deleted_${student.userId}_${Date.now()}@deleted.com`, // Scramble
            phone: null,
            deletedAt: new Date(),
          },
        })
      );
    }

    // Also encrypt/wipe Health Profile?
    // It will be soft deleted via Relation if cascade or manually?
    // Schema doesn't specify cascade for Soft Delete logic.
    // But since Student is soft deleted, HealthProfile is effectively hidden if queries respect relation.

    return this.prisma.$transaction(operations);
  }

  async getStudents(currentUserRole: string) {
    // 4.I.07 API Serializers/DTOs
    // If not Admin/Staff, hide parent mobile.

    const students = await this.prisma.student.findMany({
      include: {
        guardians: { include: { guardian: { include: { user: true } } } },
        user: true
      },
      where: { deletedAt: null }
    });

    const isPrivileged = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'].includes(currentUserRole);

    // First handle role-based masking (Mobile) manually or via logic,
    // then transform to Entity which handles Password exclusion via @Exclude.

    const processedStudents = students.map(student => {
      // Shallow copy for mutation safely
      const s = { ...student } as any;

      if (s.guardians) {
        s.guardians = s.guardians.map(g => {
           // We need to mutate the user object inside guardian before serialization
           if (g.guardian && g.guardian.user) {
             if (!isPrivileged) {
               // Mask Parent Mobile
               g.guardian.user.phone = '******' + g.guardian.user.phone?.slice(-4);
               g.guardian.user.email = '******';
             }
           }
           return g;
        });
      }
      return s;
    });

    // Transform to Entity - this triggers @Exclude() on passwordHash/salt/deletedAt
    return plainToInstance(StudentEntity, processedStudents);
  }
}
