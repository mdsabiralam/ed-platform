import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Req } from '@nestjs/common';
import { ConciergeService } from './concierge.service';
import { CreateConciergeRequestDto } from './dto/create-concierge-request.dto';
import { UpdateConciergeRequestDto } from './dto/update-concierge-request.dto';
import { PublishRequestDto } from './dto/publish-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestStatus } from '@prisma/client';

@Controller('concierge')
@UseGuards(JwtAuthGuard)
export class ConciergeController {
  constructor(private readonly conciergeService: ConciergeService) {}

  @Post('request')
  create(@Body() dto: CreateConciergeRequestDto, @Req() req: any) {
    // Assuming req.user.sub is the userId (standard JWT claim)
    return this.conciergeService.create(dto, req.user.sub);
  }

  @Get('requests')
  findAll(@Query('status') status?: RequestStatus) {
    // In a real app, I'd check if user is STAFF/ADMIN here
    return this.conciergeService.findAll(status);
  }

  @Get('staff/pending-requests')
  findAllForStaff(@Req() req: any, @Query('status') status?: RequestStatus) {
      return this.conciergeService.findAllForStaff(req.user.sub, status);
  }

  @Get('request/:id')
  findOne(@Param('id') id: string) {
    return this.conciergeService.getRequest(id);
  }

  @Patch('request/:id')
  update(@Param('id') id: string, @Body() dto: UpdateConciergeRequestDto) {
    return this.conciergeService.update(id, dto);
  }

  @Post('request/:id/publish')
  publish(@Param('id') id: string, @Body() dto: PublishRequestDto) {
    return this.conciergeService.publish(id, dto);
  }
}
