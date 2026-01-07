import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { HrService } from './hr.service';
import { ServiceBookEventType } from '@prisma/client';

@ApiTags('HR - Service Book')
@Controller('api/hr/service-book')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('entry')
  @ApiOperation({ summary: 'Create a new service book entry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        staffId: { type: 'string' },
        eventDate: { type: 'string', format: 'date-time' },
        eventType: {
          type: 'string',
          enum: [
            'Appointment',
            'Probation_Clearance',
            'Confirmation',
            'Promotion',
            'Transfer',
            'Suspension',
            'Termination',
          ],
        },
        documentUrl: { type: 'string' },
        authorizedBy: { type: 'string' },
      },
    },
  })
  async createEntry(
    @Body()
    data: {
      staffId: string;
      eventDate: string;
      eventType: ServiceBookEventType;
      documentUrl?: string;
      authorizedBy: string;
    },
  ) {
    return this.hrService.createServiceBookEntry({
      ...data,
      eventDate: new Date(data.eventDate),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service book entries for a staff member' })
  async getServiceBook(@Param('id') id: string) {
    return this.hrService.getServiceBook(id);
  }
}
