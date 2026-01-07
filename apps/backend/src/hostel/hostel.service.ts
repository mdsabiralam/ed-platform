import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { RollCallDto } from './dto/roll-call.dto';
import { ScanGatePassDto } from './dto/scan-pass.dto';
import * as geolib from 'geolib';

@Injectable()
export class HostelService {
  constructor(private readonly prisma: PrismaService) {}

  async allocateBed(dto: AllocateBedDto) {
    // 3. Add Logic: Prevent allocation if the room is already at full capacity
    const room = await this.prisma.hostelRoom.findUnique({
      where: { id: dto.roomId },
      include: { _count: { select: { beds: true } } },
    });

    if (!room) throw new NotFoundException('Room not found');

    if (room._count.beds >= room.capacity) {
      throw new BadRequestException('Room is at full capacity');
    }

    // Allocate
    return this.prisma.hostelBed.create({
      data: {
        roomId: dto.roomId,
        bedNumber: dto.bedNumber,
        studentId: dto.studentId,
      },
    });
  }

  async rollCall(dto: RollCallDto) {
    // 2. Verification: Calculate distance between Warden's GPS and the Hostel Building's static GPS.
    // Assuming we verify against the building where these students belong?
    // Or warden is assigned to a building?
    // Let's assume we pick the building of the first student or pass buildingId?
    // Prompt: "Hostel Building's static GPS".
    // I need to know which building. I'll fetch it from the first student's bed.

    if (dto.studentList.length === 0) return { verified: true }; // No students?

    const studentId = dto.studentList[0];
    const bed = await this.prisma.hostelBed.findUnique({
      where: { studentId },
      include: { room: { include: { building: true } } },
    });

    if (!bed) throw new NotFoundException('Student bed not found to verify location');

    const building = bed.room.building;

    // Calculate distance
    const distance = geolib.getDistance(
      { latitude: dto.wardenLat, longitude: dto.wardenLng },
      { latitude: building.lat, longitude: building.lng }
    );

    // 3. If distance > 100 meters, reject
    if (distance > 100) {
      throw new BadRequestException('Location Mismatch: You are too far from the hostel building');
    }

    return { success: true, message: 'Roll call verified' };
  }

  async scanGatePass(dto: ScanGatePassDto) {
    // 1. Mark out_time
    const pass = await this.prisma.gatePass.findUnique({ where: { qrCode: dto.qrCode } });
    if (!pass) throw new NotFoundException('Invalid Gate Pass');

    if (pass.status !== 'APPROVED') throw new BadRequestException('Pass is not valid');

    const updated = await this.prisma.gatePass.update({
      where: { id: pass.id },
      data: {
        outTime: new Date(),
        status: 'USED', // or active?
      },
    });

    // 3. Notify parents (Mock)
    console.log(`Push Notification to parent of ${pass.studentId}: Student has left campus.`);

    return updated;
  }

}
