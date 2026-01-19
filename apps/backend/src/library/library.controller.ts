import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('book/:tenantId/:barcode')
  async getBook(@Param('tenantId') tenantId: string, @Param('barcode') barcode: string) {
    return this.libraryService.getBookByBarcode(tenantId, barcode);
  }

  @Post('issue')
  async issueBook(@Body() body: { tenantId: string; barcode: string; studentId: string }) {
    return this.libraryService.issueBook(body.tenantId, body.barcode, body.studentId);
  }
}
