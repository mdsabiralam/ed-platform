import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../shared/pdf/pdf.service';
import { getIdCardTemplate } from '../shared/pdf/templates';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async generateIdCard(studentId: string): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { section: { include: { class: true } } },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const qrCodeData = await QRCode.toDataURL(studentId);

    // Format dates and address nicely.
    // Assuming dob is a Date object.
    const dob = student.dob ? student.dob.toISOString().split('T')[0] : 'N/A';

    const html = getIdCardTemplate({
      name: `${student.firstName} ${student.lastName}`,
      class: `${student.section?.class?.name || ''} - ${student.section?.name || ''}`,
      dob: dob,
      address: student.address || 'N/A',
      photo_url: student.photoUrl || '',
      qr_code: qrCodeData,
    });

    const pdfBuffer = await this.pdfService.generatePdfFromHtml(html);
    return this.pdfService.injectWatermark(pdfBuffer);
  }

  async generateClassIdCards(classId: string): Promise<Buffer> {
    const students = await this.prisma.student.findMany({
      where: { section: { classId: classId } },
      include: { section: { include: { class: true } } },
    });

    if (!students.length) {
      throw new NotFoundException('No students found for this class');
    }

    const htmls: string[] = [];

    for (const student of students) {
      const qrCodeData = await QRCode.toDataURL(student.id);
      const dob = student.dob ? student.dob.toISOString().split('T')[0] : 'N/A';

      const html = getIdCardTemplate({
        name: `${student.firstName} ${student.lastName}`,
        class: `${student.section?.class?.name || ''} - ${student.section?.name || ''}`,
        dob: dob,
        address: student.address || 'N/A',
        photo_url: student.photoUrl || '',
        qr_code: qrCodeData,
      });
      htmls.push(html);
    }

    const buffers = await this.pdfService.generatePdfsFromHtmls(htmls);
    const watermarkedBuffers: Buffer[] = [];

    for (const buffer of buffers) {
      const watermarked = await this.pdfService.injectWatermark(buffer);
      watermarkedBuffers.push(watermarked);
    }

    return this.pdfService.mergePdfs(watermarkedBuffers);
  }
}
