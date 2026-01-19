import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  async getLiveLocation(vehicleId: string) {
    // Try to get real latest location
    const latest = await this.prisma.vehicleLocation.findFirst({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
    });

    if (latest) {
      return latest;
    }

    // Mock data if no real data exists
    return {
      latitude: 23.8103 + (Math.random() * 0.001),
      longitude: 90.4125 + (Math.random() * 0.001),
      timestamp: new Date(),
    };
  }
}
