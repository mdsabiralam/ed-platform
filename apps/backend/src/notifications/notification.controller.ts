import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { BulkNotificationDto } from './dto/bulk-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('bulk')
    async sendBulk(@Body() dto: BulkNotificationDto) {
        // In real app, check permissions (Admin/Staff only)
        return this.notificationService.sendBulkNotification(dto.userIds, dto.message, dto.senderId);
    }
}
