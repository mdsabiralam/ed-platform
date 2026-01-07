import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { RollCallDto } from './dto/roll-call.dto';
import { ScanGatePassDto } from './dto/scan-pass.dto';

@Controller('api')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Post('hostel/allocate')
  async allocateBed(@Body() dto: AllocateBedDto) {
    return this.hostelService.allocateBed(dto);
  }

  @Post('hostel/roll-call')
  async rollCall(@Body() dto: RollCallDto) {
    return this.hostelService.rollCall(dto);
  }

  @Post('gatepass/scan')
  async scanGatePass(@Body() dto: ScanGatePassDto) {
    return this.hostelService.scanGatePass(dto);
  }
}
