import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MarksService } from './marks.service';
import { Express } from 'express';
import 'multer'; // Ensure global types are loaded

@Controller('api/academic/marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.marksService.bulkUpload(file.buffer);
  }
}
