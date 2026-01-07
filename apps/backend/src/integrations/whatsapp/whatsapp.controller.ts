
import { Controller, Post, Get, Body, Query, HttpCode, ForbiddenException, Req, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';

@Controller('api/integrations/whatsapp/webhook')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly whatsappService: WhatsAppService
  ) {}

  @Get()
  verifyWebhook(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verified successfully');
      return challenge; // Return plain text challenge as per Meta API
    }
    throw new ForbiddenException('Invalid verification token');
  }

  @Post()
  @HttpCode(200)
  async handleIncomingEvent(@Body() body: any) {
    // Basic implementation to handle incoming messages
    if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
            for (const change of entry.changes) {
                const value = change.value;

                if (value.messages) {
                    for (const message of value.messages) {
                         if (message.type === 'text') {
                             const from = message.from; // Phone number
                             const text = message.text.body;

                             // Dispatch to service
                             await this.whatsappService.handleIncomingMessage(from, text);
                         }
                    }
                }

                if (value.statuses) {
                    // Update status logic (Step 4.4)
                    for (const status of value.statuses) {
                        await this.whatsappService.updateMessageStatus(status.id, status.status);
                    }
                }
            }
        }
    }
    return { status: 'ok' };
  }
}
