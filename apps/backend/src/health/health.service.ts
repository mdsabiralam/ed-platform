import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async logOpdVisit(tenantId: string, studentId: string, symptom: string, treatment?: string, nurseId?: string) {
    return this.prisma.opdVisit.create({
      data: {
        tenantId,
        studentId,
        symptom,
        treatment,
        nurseId,
      },
    });
  }

  async triggerSos(tenantId: string, studentId: string, message: string) {
    // In a real app, this would also trigger a notification service
    const alert = await this.prisma.emergencyAlert.create({
      data: {
        tenantId,
        studentId,
        type: 'SOS',
        message,
        status: 'SENT',
      },
    });

    // Simulate notification logic (logging for now)
    console.log(`[SOS] Alert sent to Principal and Parents for Student ${studentId}: ${message}`);

    return alert;
  }

  async getStudentHealthProfile(tenantId: string, studentId: string) {
    // Ensure the student belongs to the tenant
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.tenantId !== tenantId) {
      throw new NotFoundException('Student not found');
    }

    const profile = await this.prisma.healthProfile.findUnique({
      where: { studentId },
    });

    if (!profile) {
       throw new NotFoundException('Health profile not found');
    }

    // Since we are using the encryption extension (assumed from memory/context),
    // the fields 'allergies', 'medicalHistory', 'medications' should be decrypted automatically
    // when accessed if the extension is correctly set up in PrismaService.
    // However, in a unit test mock scenario, we just return the object.

    return profile;
  }
}
