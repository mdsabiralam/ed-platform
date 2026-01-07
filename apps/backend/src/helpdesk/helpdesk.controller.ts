import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { HelpdeskService } from './helpdesk.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Helpdesk')
@ApiBearerAuth()
@Controller('api/helpdesk/tickets')
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new support ticket' })
  async create(@Body() createTicketDto: CreateTicketDto, @Req() req: any) {
    // Assuming req.user is populated by JwtStrategy
    const userId = req.user.id;
    const tenantId = req.user.tenantId; // Assuming user belongs to a tenant
    return this.helpdeskService.create(createTicketDto, userId, tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a ticket by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.helpdeskService.findOne(id, userId);
  }
}
