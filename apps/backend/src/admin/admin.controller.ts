import { Controller, Post, Param, Res, StreamableFile, Header } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('generate-id/:studentId')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="id-card.pdf"')
  async generateIdCard(@Param('studentId') studentId: string, @Res() res: Response) {
    const buffer = await this.adminService.generateIdCard(studentId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('generate-id/batch/:classId')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="class-id-cards.pdf"')
  async generateClassIdCards(@Param('classId') classId: string, @Res() res: Response) {
    const buffer = await this.adminService.generateClassIdCards(classId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
