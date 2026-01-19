import { Controller, Post, Body, Param } from '@nestjs/common';
import { TransportService } from './transport.service';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Post('trip/start')
  async startTrip(@Body() body: { tenantId: string; driverId: string; vehicleNo: string }) {
    return this.transportService.startTrip(body.tenantId, body.driverId, body.vehicleNo);
  }

  @Post('trip/:id/gps')
  async logGps(@Param('id') tripId: string, @Body() body: { latitude: number; longitude: number }) {
    return this.transportService.logGps(tripId, body.latitude, body.longitude);
  }
}
