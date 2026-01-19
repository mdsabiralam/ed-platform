import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  async startTrip(tenantId: string, driverId: string, vehicleNo: string) {
    return this.prisma.trip.create({
      data: {
        tenantId,
        driverId,
        vehicleNo,
        status: 'STARTED',
        startTime: new Date(),
      },
    });
  }

  async logGps(tripId: string, latitude: number, longitude: number) {
    return this.prisma.gpsLog.create({
      data: {
        tripId,
        latitude,
        longitude,
        timestamp: new Date(),
      },
    });
  }
}
