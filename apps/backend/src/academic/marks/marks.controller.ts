
import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MarksService } from './marks.service';

@ApiTags('Academic - Marks')
@Controller('api/academic/marks')
export class MarksController {
    constructor(private readonly marksService: MarksService) {}

    @Post('bulk-upload')
    @ApiOperation({ summary: 'Bulk upload marks via CSV' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
       schema: {
         type: 'object',
         properties: {
           file: {
             type: 'string',
             format: 'binary',
           },
         },
       },
    })
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    async bulkUpload(@UploadedFile() file: any) {
        if (!file) throw new BadRequestException('File is required');

        const result = await this.marksService.processBulkUpload(file.buffer);
        return { message: 'Marks uploaded successfully', count: result.count };
    }
}
