import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdmissionSessionDto } from '../dto/create-admission-session.dto';

@Injectable()
export class AdmissionSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createDto: CreateAdmissionSessionDto) {
    return this.prisma.$transaction(async (tx) => {
      const isActive = createDto.is_active ?? false;

      if (isActive) {
        await tx.admissionSession.updateMany({
          where: { tenantId, isActive: true },
          data: { isActive: false },
        });
      }

      return tx.admissionSession.create({
        data: {
          tenantId,
          name: createDto.name,
          startDate: new Date(createDto.start_date),
          endDate: new Date(createDto.end_date),
          isActive,
        },
      });
    });
  }

  async checkSeatAvailability(classId: string): Promise<boolean> {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { applications: { where: { status: 'APPROVED' } } },
        },
      },
    });

    if (!classData) return false;

    // Compare approved applications (admissions) vs seat capacity
    if (classData._count.applications >= classData.seatCapacity) {
      throw new BadRequestException('Seat capacity full for this class');
    }

    return true;
  }

  async findActive(tenantId: string) {
    // 4.A.04: Query for is_active = true
    const session = await this.prisma.admissionSession.findFirst({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!session) {
      throw new NotFoundException('No active admission session found');
    }

    return session;
  }
}
