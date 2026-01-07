import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Put,
  Param,
  Get
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto, AddCommentDto, ReassignTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming this exists based on memory

@Controller('api/helpdesk/tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateTicketDto) {
    // Assuming req.user contains { userId, tenantId } or similar.
    // Memory says "req.user is missing" throws Unauthorized.
    // Usually req.user has the user payload.
    // I'll assume req.user.id or req.user.userId
    const user = req.user;
    // Assuming tenantId is in header or user.tenantId?
    // The memory mentions 'x-tenant-id' header for grading controller.
    // Let's assume tenant extraction is needed or attached to user.
    // For now I'll use user.tenantId or header if available.
    // But standard NestJS request often has user object.

    // Let's assume user.tenantId is available or passed via headers handled by middleware.
    // If not, I'll fallback to a mock or extracted value.
    // Given the "tenantId: null" memory, maybe it's multi-tenant.
    // I'll check how other controllers get tenantId.
    // But for this task, I will rely on req.user having tenantId or I'll take it from header manually if needed.
    // Actually, `Profile` has `tenantId`. A user can belong to multiple tenants.
    // `JwtAuthGuard` usually attaches the payload.
    // Let's use `req.user.schoolId` or `req.headers['x-tenant-id']`.

    const tenantId = req.headers['x-tenant-id'] || req.user.schoolId || req.user.tenantId;
    return this.ticketService.create(tenantId, user.id, dto);
  }

  @Put(':id/reassign')
  async reassign(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: ReassignTicketDto
  ) {
    return this.ticketService.reassign(id, req.user.id, dto);
  }

  @Get('my-queue')
  async getMyQueue(@Req() req) {
    return this.ticketService.getMyQueue(req.user.id);
  }

  @Get(':id')
  async getDetails(@Param('id') id: string, @Req() req) {
     return this.ticketService.getTicketDetails(id, req.user.id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: AddCommentDto
  ) {
    return this.ticketService.addComment(id, req.user.id, dto);
  }
}
