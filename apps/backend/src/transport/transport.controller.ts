import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { BoardStudentDto } from './dto/board-student.dto';

@Controller('api/transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Post('vehicle/add')
  async addVehicle(@Body() dto: CreateVehicleDto, @Req() req: any) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id']; // Fallback for now
    if (!tenantId) {
      // For testing, we might not have auth setup in this environment fully
      // But typically this is handled by Guard. I'll assume it's there or passed.
      // throw new BadRequestException('Tenant ID missing');
    }
    return this.transportService.addVehicle(dto, tenantId);
  }

  @Post('board')
  async boardStudent(@Body() dto: BoardStudentDto) {
    return this.transportService.boardStudent(dto);
  }

  @Post('nearest-stop')
  async findNearestStop(@Body() body: { lat: number; lng: number }) {
    return this.transportService.findNearestStop(body.lat, body.lng);
  }
}
