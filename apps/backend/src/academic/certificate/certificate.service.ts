import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as fs from 'fs';

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService) {}

  async approveRequest(requestId: string, principalName: string) {
    // 1. Fetch the request
    const request = await this.prisma.transferCertificate.findUnique({
      where: { id: requestId },
      include: { student: true },
    });

    if (!request) {
      throw new NotFoundException('Transfer Certificate request not found');
    }

    // 2. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('Transfer Certificate', {
      x: 50,
      y: height - 50,
      size: 30,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`This is to certify that ${request.student.firstName} ${request.student.lastName}`, {
      x: 50,
      y: height - 100,
      size: 20,
      font,
    });

    page.drawText(`Admission No: ${request.student.admissionNo}`, {
      x: 50,
      y: height - 130,
      size: 15,
      font,
    });

    // Digital Signature Simulation
    page.drawText(`Approved by Principal: ${principalName}`, {
      x: 50,
      y: height - 200,
      size: 15,
      font,
      color: rgb(0, 0.5, 0),
    });

    page.drawText(`(Digitally Signed at ${new Date().toISOString()})`, {
        x: 50,
        y: height - 220,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    // In a real app, upload to S3. Here we simulate a URL.
    const fakeUrl = `https://storage.example.com/certificates/${requestId}.pdf`;

    // 3. Update DB
    await this.prisma.transferCertificate.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        certificateUrl: fakeUrl,
        issuedAt: new Date(),
      },
    });

    return { url: fakeUrl, pdfBytes }; // Return bytes for verification in test
  }
}
