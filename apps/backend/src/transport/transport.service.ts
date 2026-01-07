import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { BoardStudentDto } from './dto/board-student.dto';

@Injectable()
export class TransportService {
  constructor(private readonly prisma: PrismaService) {}

  async addVehicle(dto: CreateVehicleDto, tenantId: string) {
    // 3. Add validation: Throw an error if fitness_cert_expiry is in the past
    if (new Date(dto.fitnessCertExpiry) < new Date()) {
      throw new BadRequestException('Bus is unfit: Fitness certificate expired');
    }

    return this.prisma.vehicle.create({
      data: {
        ...dto,
        tenantId,
        insuranceExpiry: new Date(dto.insuranceExpiry),
        fitnessCertExpiry: new Date(dto.fitnessCertExpiry),
      },
    });
  }

  async boardStudent(dto: BoardStudentDto) {
    // 2. Action: Log the boarding time and location
    const record = await this.prisma.transportAttendance.create({
      data: {
        tripId: dto.tripId,
        studentId: dto.studentId,
        lat: dto.lat,
        lng: dto.lng,
      },
    });

    // 3. Trigger: Send an SMS (Mocked)
    console.log(`Sending SMS to parent of ${dto.studentId}: Your child has boarded the bus at ${record.boardTime}`);

    return { success: true, message: 'Boarding recorded', record };
  }

  async findNearestStop(lat: number, lng: number) {
    // 3. Write a SQL query using ST_Distance to find the nearest bus stop
    // Using raw SQL for PostGIS function ST_Distance
    // Assuming SRID 4326 for lat/lng

    // We want the stop with minimum distance.
    const result = await this.prisma.$queryRaw`
      SELECT id, name, lat, lng,
             ST_Distance(
               ST_SetSRID(ST_MakePoint(lng, lat), 4326),
               ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
             ) as distance
      FROM route_stops
      ORDER BY distance ASC
      LIMIT 1
    `;

    return result[0];
  }
}
