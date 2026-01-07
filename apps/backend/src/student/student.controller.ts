import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ForbiddenException, Res, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateCorrectionRequestDto, ApproveCorrectionRequestDto } from './dto/create-correction-request.dto';
import { PdfService } from '../common/services/pdf.service';
import { Response } from 'express';

// Mock Guards for simplicity as AuthModule is not fully explored/implemented in this session
// In a real app, use @UseGuards(JwtAuthGuard, RolesGuard)

@Controller('api/students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly pdfService: PdfService
  ) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Request() req) {
    // SECURITY WARNING: This is a temporary mock for role-based access.
    // In production, replace with @UseGuards(JwtAuthGuard, RolesGuard) and access req.user.role
    const role = req.headers['x-role'] || 'PARENT';
    return this.studentService.getStudents(role);
  }

  @Post('correction-request')
  async createCorrectionRequest(@Body() dto: CreateCorrectionRequestDto, @Request() req) {
    const userId = req.headers['x-user-id']; // Mock User ID
    if (!userId) throw new ForbiddenException('User ID required');
    return this.studentService.createCorrectionRequest(userId, dto);
  }

  @Get('correction-requests')
  async getCorrectionRequests(@Request() req) {
    // Admin Only
    const role = req.headers['x-role'];
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') throw new ForbiddenException('Admin access required');
    return this.studentService.getCorrectionRequests();
  }

  @Put('correction-request/:id/approve')
  async approveCorrectionRequest(@Param('id') id: string, @Body() dto: ApproveCorrectionRequestDto, @Request() req) {
    // Admin Only
    const role = req.headers['x-role'];
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') throw new ForbiddenException('Admin access required');
    return this.studentService.approveCorrectionRequest(id, dto);
  }

  @Post(':id/anonymize')
  async anonymizeStudent(@Param('id') id: string, @Request() req) {
    // Admin Only or Self (Right to be Forgotten)
    const role = req.headers['x-role'];
     if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') throw new ForbiddenException('Admin access required');
    return this.studentService.anonymizeStudent(id);
  }

  @Get(':id/service-book')
  async downloadServiceBook(@Param('id') id: string, @Res() res: Response) {
      const buffer = await this.pdfService.generateServiceBook(id);
      res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="service_book_${id}.pdf"`,
          'Content-Length': buffer.length,
      });
      res.end(buffer);
  }
}
