import { Injectable } from '@nestjs/common';
import { MarksheetLayout } from '../interfaces/marksheet-layout.interface';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

@Injectable()
export class PdfGeneratorService {
  async generatePdf(
      layout: MarksheetLayout,
      studentData: any,
      options?: {
          backgroundImageUrl?: string;
          disclaimerText?: string;
          pageSize?: 'A4' | 'LETTER';
          signatureImages?: Record<string, string>;
      }
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const size = options?.pageSize === 'LETTER' ? PageSizes.Letter : PageSizes.A4;
    const page = pdfDoc.addPage(size);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // 6.F.08: Background Image
    if (options?.backgroundImageUrl) {
        try {
            // Attempt to fetch image. Requires Node 18+ or polyfill.
            const response = await fetch(options.backgroundImageUrl);
            if (response.ok) {
                const imgBuffer = await response.arrayBuffer();
                // Check format simple logic or try both
                let image;
                if (options.backgroundImageUrl.endsWith('.png')) {
                    image = await pdfDoc.embedPng(imgBuffer);
                } else {
                    image = await pdfDoc.embedJpg(imgBuffer);
                }

                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width,
                    height,
                    opacity: 0.1,
                });
            }
        } catch (e) {
            console.warn('Could not load background image:', e);
        }
    }

    let y = height - 50;

    // Header
    const headerSize = layout.header.schoolNameFontSize || 24;
    page.drawText('School Name', { x: 50, y, size: headerSize, font });
    y -= 40;

    // Student Info
    if (layout.studentInfo?.fields) {
        for (const field of layout.studentInfo.fields) {
            const val = studentData[field] || 'N/A';
            page.drawText(`${field.toUpperCase()}: ${val}`, { x: 50, y, size: fontSize, font });
            y -= 20;
        }
    }
    y -= 20;

    // Marks Table Header
    const visibleCols = layout.marksTable.visible_columns;
    let x = 50;
    for (const col of visibleCols) {
        page.drawText(col.toUpperCase(), { x, y, size: 10, font });
        x += 100; // Simple spacing
    }
    y -= 20;

    // Marks Table Rows (Dummy data logic)
    if (studentData.marks) {
        for (const mark of studentData.marks) {
            x = 50;
            for (const col of visibleCols) {
                let val = '';
                if (col === 'subject') val = mark.subject;
                else if (col === 'max_marks') val = mark.max.toString();
                else if (col === 'marks_obtained') val = mark.obtained.toString();
                else if (col === 'grade') val = mark.grade;
                else if (col === 'percentage') val = mark.percentage + '%';
                else if (col === 'remarks') val = mark.remarks || '';
                else if (col === 'attendance') val = '95%'; // Mock

                page.drawText(val, { x, y, size: 10, font });
                x += 100;
            }
            y -= 20;
        }
    }

    // Footer
    y = 100;
    if (layout.footer?.signatures) {
        for (const sig of layout.footer.signatures) {
            let sigX = 50;
            if (sig.position === 'center') sigX = width / 2 - 50;
            if (sig.position === 'right') sigX = width - 150;

            page.drawText(sig.title, { x: sigX, y, size: 10, font });

            // Signature Image
            if (options?.signatureImages && options.signatureImages[sig.title]) {
                const sigUrl = options.signatureImages[sig.title];
                try {
                     const response = await fetch(sigUrl);
                     if (response.ok) {
                         const imgBuffer = await response.arrayBuffer();
                         let image;
                         if (sigUrl.endsWith('.png')) image = await pdfDoc.embedPng(imgBuffer);
                         else image = await pdfDoc.embedJpg(imgBuffer);

                         page.drawImage(image, {
                             x: sigX,
                             y: y + 15,
                             width: 100,
                             height: 50,
                         });
                     }
                } catch (e) {
                    console.warn(`Could not load signature for ${sig.title}:`, e);
                }
            }
        }
    }

    // 6.F.09: Configurable Disclaimer
    if (options?.disclaimerText) {
        page.drawText(options.disclaimerText, {
            x: 50,
            y: 20,
            size: 8,
            font,
            color: rgb(0.5, 0.5, 0.5)
        });
    }

    return pdfDoc.save();
  }
}
