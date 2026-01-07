
import { Controller, Post, Get, Param, ForbiddenException, Res, StreamableFile, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResultService } from './result.service';
import { MarksheetGeneratorService } from '../marksheet/marksheet-generator.service';
import type { Response } from 'express';

@ApiTags('Academic - Result')
@Controller('api/academic/result')
export class ResultController {
    constructor(
        private readonly resultService: ResultService,
        private readonly marksheetGenerator: MarksheetGeneratorService
    ) {}

    @Get('pdf/:id')
    @ApiOperation({ summary: 'Get Marksheet PDF' })
    @ApiBearerAuth()
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'inline; filename="marksheet.pdf"')
    async getMarksheetPdf(@Param('id') id: string): Promise<StreamableFile> {
        // Integrated Fee Check
        const hasDues = await this.resultService.checkDues(id);

        if (hasDues) {
            throw new ForbiddenException('Please clear outstanding dues to view result');
        }

        // Generate PDF
        // In real app, we fetch result data here
        const mockResultData = {
            subjects: [
                { name: 'Math', marks: 95 },
                { name: 'Science', marks: 88 }
            ]
        };

        const pdfBuffer = await this.marksheetGenerator.generatePdf(id, mockResultData);

        return new StreamableFile(pdfBuffer);
    }

    @Post(':id/release')
    @ApiOperation({ summary: 'Release result for a student (overriding blocks)' })
    @ApiBearerAuth()
    releaseResult(@Param('id') id: string) {
        return { message: 'Result released' };
    }

    @Post('process')
    @ApiOperation({ summary: 'Trigger result calculation process' })
    @ApiBearerAuth()
    processResults() {
        return { message: 'Calculation started' };
    }
}
