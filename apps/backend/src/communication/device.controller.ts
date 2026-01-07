import { Controller, Post, Body, UseGuards, Req, Param, Patch } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { PrismaService } from '../prisma/prisma.service'; // Assuming PrismaService is global or in shared
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Communication')
@ApiBearerAuth()
@Controller('api/communication/fcm')
@UseGuards(JwtAuthGuard)
export class DeviceController {
  constructor(
    private readonly fcmService: FcmService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a device token' })
  @ApiBody({ schema: { example: { token: 'abc', platform: 'ANDROID' } } })
  async register(@Body() body: { token: string; platform: string }, @Req() req: any) {
    // req.user is guaranteed by JwtAuthGuard
    // The previous code allowed body['userId'] override, which is dangerous if not admin.
    // We should strictly use req.user.id (or sub).
    // However, the guard I implemented puts a mock user { id: 'user-123' }.

    const userId = req.user?.id || req.user?.userId;

    const { token, platform } = body;

    // Check if token exists
    const existingDevice = await this.prisma.userDevice.findUnique({
      where: { fcmToken: token },
    });

    if (existingDevice) {
      if (existingDevice.userId !== userId && userId) {
        // Move to new user
        await this.prisma.userDevice.update({
          where: { id: existingDevice.id },
          data: { userId: userId, lastActiveAt: new Date() },
        });
      } else {
        // Just update last active
        await this.prisma.userDevice.update({
          where: { id: existingDevice.id },
          data: { lastActiveAt: new Date() },
        });
      }
    } else if (userId) {
      // Create new
      await this.prisma.userDevice.create({
        data: {
          userId,
          fcmToken: token,
          platform: platform || 'ANDROID',
        },
      });
    }

    return { success: true };
  }

  @Post('send-custom')
  @ApiOperation({ summary: 'Send a custom push notification' })
  @UseGuards(AdminGuard)
  async sendCustom(@Body() body: { targetUserId?: string; topic?: string; title: string; body: string; imageUrl?: string; data?: any }) {
    const { targetUserId, topic, title, body: messageBody, imageUrl, data } = body;

    if (topic) {
        // Send to Topic
        try {
            const messageId = await this.fcmService.sendPushToTopic(topic, title, messageBody, data, imageUrl);

            // Log notification (Topic broadcast)
            await this.prisma.notificationLog.create({
                data: {
                    topic: topic,
                    title,
                    body: messageBody,
                    data: data || {},
                    messageId,
                },
            });
            return { success: true, messageId, target: 'topic' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    } else if (targetUserId) {
        // Send to User
        const devices = await this.prisma.userDevice.findMany({
            where: { userId: targetUserId },
        });

        const results = [];
        for (const device of devices) {
            try {
                const messageId = await this.fcmService.sendPush(device.fcmToken, title, messageBody, data, imageUrl);

                // Log notification
                await this.prisma.notificationLog.create({
                    data: {
                        targetUserId,
                        title,
                        body: messageBody,
                        data: data || {},
                        messageId,
                    },
                });
                results.push({ deviceId: device.id, status: 'sent', messageId });
            } catch (error) {
                results.push({ deviceId: device.id, status: 'failed', error: error.message });
            }
        }
        return { results, target: 'user' };
    } else {
        return { success: false, error: 'Either targetUserId or topic must be provided' };
    }
  }

  @Post('track-open/:messageId')
  @ApiOperation({ summary: 'Track notification open' })
  async trackOpen(@Param('messageId') messageId: string) {
    // In a real world, messageId from FCM might not be unique globally across all time without prefix,
    // but usually it's unique enough or we use our own ID.
    // The prompt says "Return the messageId provided by Firebase".
    // Firebase message IDs are strings.

    // We update all logs with this message ID (though strictly there should be one per recipient)
    // Since we store messageId in NotificationLog, we can find it.

    // Note: If we sent multicast, multiple logs might have same messageId if we stored it that way,
    // but here we loop and send individually so each gets a unique ID from sendPush (usually).

    // However, if we used multicast, they share ID.
    // Let's assume strict mapping.

    await this.prisma.notificationLog.updateMany({
      where: { messageId: messageId },
      data: { opened: true },
    });

    return { success: true };
  }
}
