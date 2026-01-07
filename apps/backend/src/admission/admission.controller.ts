import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentApplicationService } from './student-application.service';
import { FileUploadService } from './file-upload.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('admission')
export class AdmissionController {
  constructor(
    private readonly applicationService: StudentApplicationService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Post('apply')
  async apply(@Body() dto: CreateApplicationDto) {
    return this.applicationService.apply(dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
      return this.fileUploadService.uploadFile(file);
  }
}
