import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { DevBypassAuthGuard } from '../../common/guards/dev-bypass-auth.guard';

@Controller('communication/notices')
@UseGuards(DevBypassAuthGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  create(@Request() req, @Body() createNoticeDto: CreateNoticeDto) {
    const { id, tenantId, role, classId } = req.user;
    return this.noticeService.create(createNoticeDto, id, tenantId, role, classId);
  }

  @Get()
  findAll(@Request() req) {
    const { tenantId, role, classId } = req.user;
    return this.noticeService.findAll(tenantId, role, classId);
  }

  @Get('archived')
  getArchived(@Request() req) {
    const { tenantId, role } = req.user;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Only admins can view archived notices');
    }
    return this.noticeService.getArchived(tenantId);
  }

  @Post('mark-read')
  markRead(@Request() req) {
    const { id } = req.user;
    return this.noticeService.markRead(id);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
      const { id, tenantId, classId } = req.user;
      return this.noticeService.getUnreadCount(id, tenantId, classId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateNoticeDto: Partial<CreateNoticeDto>, @Request() req) {
    const { id: userId, role } = req.user;
    return this.noticeService.update(id, updateNoticeDto, userId, role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const { id: userId, role } = req.user;
    return this.noticeService.remove(id, userId, role);
  }
}
