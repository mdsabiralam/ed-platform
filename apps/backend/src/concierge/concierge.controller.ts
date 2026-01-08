import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ConciergeService } from './concierge.service';
import { CreateConciergeRequestDto } from './dto/create-concierge-request.dto';
import { UpdateConciergeRequestDto } from './dto/update-concierge-request.dto';

@Controller('concierge_requests')
export class ConciergeController {
  constructor(private readonly conciergeService: ConciergeService) {}

  @Post()
  create(@Body() createDto: CreateConciergeRequestDto) {
    return this.conciergeService.create(createDto);
  }

  @Get()
  findAll() {
    return this.conciergeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conciergeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateConciergeRequestDto) {
    return this.conciergeService.update(id, updateDto);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.conciergeService.reject(id);
  }
}
