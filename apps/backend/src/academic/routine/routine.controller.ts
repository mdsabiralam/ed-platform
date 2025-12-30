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

  // 5.J.03: Student View
  @Get('student/:id')
  async getStudentRoutine(@Req() req: any, @Query('classId') classId: string) {
      // In a real app, we would look up the student's class from the ID.
      // For now, relying on query param as implied by task logic to filter by class.
      const tenantId = req.headers['x-tenant-id'];
      return this.routineService.getRoutineEntries(tenantId, { classId });
  }

  // 5.J.03: Teacher View
  @Get('teacher/:id')
  async getTeacherRoutine(@Req() req: any, @Query('teacherId') teacherId: string) {
       const tenantId = req.headers['x-tenant-id'];
       return this.routineService.getRoutineEntries(tenantId, { teacherId });
  }
}
