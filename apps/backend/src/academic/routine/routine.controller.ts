import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { RoutineService } from './routine.service';
import { DayOfWeek } from '@prisma/client';

@Controller('academic/routine')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post()
  async createEntry(@Req() req: any, @Body() body: any) {
    const tenantId = req.headers['x-tenant-id'];
    return this.routineService.createRoutineEntry(tenantId, body);
  }

  @Get()
  async getEntries(
    @Req() req: any,
    @Query('day') day?: DayOfWeek,
    @Query('classId') classId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    const tenantId = req.headers['x-tenant-id'];
    return this.routineService.getRoutineEntries(tenantId, { dayOfWeek: day, classId, teacherId });
  }
}
