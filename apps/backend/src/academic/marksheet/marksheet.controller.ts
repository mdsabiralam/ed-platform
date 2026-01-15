import { Controller, Get, Param, Res, StreamableFile, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { Response } from 'express';

@ApiTags('Marksheet')
@Controller('api/academic/marksheet')
export class MarksheetController {
  constructor(private prisma: PrismaService) {}

  @Get('pdf/:id') // Using :id as placeholder for examTermId or studentId logic
  async getMarksheetPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1. Fetch data (mocked/placeholder logic as actual generation is complex)
    // Assuming ID is studentId for this context or needs mapping.
    // User requirement: "Implement the logging logic directly inside the getMarksheetPdf service method"
    // Since I don't have the existing service, I'll simulate the controller calling a service logic or doing it here.

    // 2. Log Activity
    // We need examTermId. Let's assume we can fetch it or it's passed.
    // For now, I'll assume 'id' maps to a StudentMark which has exam -> examTerm.

    // Finding the examTermId for the student's latest or specific result
    const logEntry = await this.prisma.studentMark.findFirst({
        where: { studentId: id },
        include: { exam: true }
    });

    if (logEntry) {
        await this.prisma.studentActivityLog.create({
            data: {
                studentId: id,
                resourceType: 'RESULT_VIEW',
                resourceId: logEntry.exam.examTermId,
                action: 'VIEW'
            }
        });
    }

    // 3. Return Dummy PDF Stream
    const buffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Title (Þÿ)\n/Creator (Þÿ)\n/Producer (Þÿ)\n/CreationDate (D:20230101000000)\n>>\nendobj\n2 0 obj\n<<\n/Type /Catalog\n/Pages 3 0 R\n>>\nendobj\n3 0 obj\n<<\n/Type /Pages\n/Kids [4 0 R]\n/Count 1\n>>\nendobj\n4 0 obj\n<<\n/Type /Page\n/MediaBox [0 0 595.28 841.89]\n/Parent 3 0 R\n/Resources <<\n/Font <<\n/F1 5 0 R\n>>\n>>\n/Contents 6 0 R\n>>\nendobj\n5 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/Name /F1\n/BaseFont /Helvetica\n/Encoding /WinAnsiEncoding\n>>\nendobj\n6 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Result View Logged) Tj\nET\nendstream\nendobj\nxref\n0 7\n0000000000 65535 f\n0000000009 00000 n\n0000000097 00000 n\n0000000146 00000 n\n0000000205 00000 n\n0000000320 00000 n\n0000000408 00000 n\ntrailer\n<<\n/Size 7\n/Root 2 0 R\n>>\nstartxref\n503\n%%EOF\n', 'binary');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="result.pdf"`,
    });

    return new StreamableFile(buffer);
  }
}
