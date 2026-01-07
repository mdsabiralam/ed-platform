import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { BroadcastService } from '../services/broadcast.service';
import { CreateCampaignDto, EstimateCostDto } from '../dto/broadcast.dto';
// Assuming JwtAuthGuard exists
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/communication')
export class CampaignController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post('send-bulk')
  // @UseGuards(JwtAuthGuard)
  async createCampaign(@Body() dto: CreateCampaignDto, @Req() req: any) {
    // Mock senderId for now since auth might not be fully wired in test env
    // In real scenario: req.user.id
    const senderId = req.user?.id || 'mock-admin-id';
    return this.broadcastService.createCampaign(dto, senderId);
  }

  @Post('estimate-cost')
  async estimateCost(@Body() dto: EstimateCostDto) {
    return this.broadcastService.estimateCost(dto);
  }

  @Get('campaign/:id/stats')
  async getStats(@Param('id') id: string) {
    return this.broadcastService.getCampaignStats(id);
  }
}
