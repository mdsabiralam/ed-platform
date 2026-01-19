import { Injectable } from '@nestjs/common';
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
}
