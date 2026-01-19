import { Controller, Get, Param } from '@nestjs/common';
import { TransportService } from './transport.service';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('live/:vehicleId')
  async getLiveLocation(@Param('vehicleId') vehicleId: string) {
    return this.transportService.getLiveLocation(vehicleId);
  }
}
