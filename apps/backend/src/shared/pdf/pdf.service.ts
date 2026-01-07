import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp', 'pdf');

  constructor() {
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create temp directory', error);
    }
  }

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        printBackground: true,
        width: '85.6mm', // Standard ID-1 width
        height: '53.98mm', // Standard ID-1 height
        pageRanges: '1',
      });
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Error generating PDF from HTML', error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  async generatePdfsFromHtmls(htmls: string[]): Promise<Buffer[]> {
    let browser;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
      const buffers: Buffer[] = [];

      // Use a single page or parallel pages?
      // Parallel pages are faster but consume more memory.
      // Sequential is safer for resources. Let's do sequential for now or reuse page.
      const page = await browser.newPage();

      for (const html of htmls) {
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            printBackground: true,
            width: '85.6mm', // Standard ID-1 width
            height: '53.98mm', // Standard ID-1 height
            pageRanges: '1',
        });
        buffers.push(Buffer.from(pdfBuffer));
      }
      return buffers;
    } catch (error) {
      this.logger.error('Error generating PDFs from HTMLs', error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  // Overloaded method for standard pages (A4/Letter) if needed, but the prompt emphasizes ID Cards.
  // We can make dimensions configurable.
  async generatePdfFromHtmlWithOptions(html: string, options: any): Promise<Buffer> {
      let browser;
      try {
        browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true,
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
          printBackground: true,
          ...options
        });
        return Buffer.from(pdfBuffer);
      } catch (error) {
        this.logger.error('Error generating PDF from HTML', error);
        throw error;
      } finally {
        if (browser) await browser.close();
      }
    }

  async mergePdfs(buffers: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();
    for (const buffer of buffers) {
      const pdf = await PDFDocument.load(buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const savedPdf = await mergedPdf.save();
    return Buffer.from(savedPdf);
  }

  async injectWatermark(pdfBuffer: Buffer, text: string = 'Powered by ed'): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width / 2 - 50, // Approximate centering
        y: height / 2,
        size: 20,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.1,
        rotate: degrees(45),
      });
    }

    const savedPdf = await pdfDoc.save();
    return Buffer.from(savedPdf);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldFiles() {
    this.logger.log('Running cleanup of old PDF files');
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          this.logger.log(`Deleted old file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Error during file cleanup', error);
    }
  }
}
