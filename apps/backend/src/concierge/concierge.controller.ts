import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ConciergeService } from './concierge.service';
import { CreateConciergeRequestDto } from './dto/create-concierge-request.dto';

@Controller('concierge/requests')
export class ConciergeController {
  constructor(private readonly conciergeService: ConciergeService) {}

  @Get()
  findAll(@Query('status') status: string) {
    return this.conciergeService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conciergeService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateConciergeRequestDto) {
    return this.conciergeService.create(createDto);
  }

  @Patch(':id/assign')
  assignStaff(@Param('id') id: string, @Body('staffId') staffId: string) {
    return this.conciergeService.assignStaff(id, staffId);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Body('content') content: any) {
    return this.conciergeService.publish(id, content);
  }

  @Post(':id/auto-generate')
  autoGenerate(@Param('id') id: string) {
    return this.conciergeService.autoGenerate(id);
  }
}
