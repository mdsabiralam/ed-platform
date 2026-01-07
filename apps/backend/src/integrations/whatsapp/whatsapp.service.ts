
import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust path
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @Inject(MetaWhatsAppProvider) private readonly provider: MetaWhatsAppProvider,
    private readonly prisma: PrismaService,
  ) {}

  async sendTemplateMessage(to: string, templateName: string, languageCode: string, components: any[] = []) {
    // DLT Compliance / Template Validation
    const template = await this.prisma.whatsAppTemplate.findUnique({
        where: { templateName }
    });

    if (!template || template.status !== 'APPROVED') {
        const msg = `Blocked attempt to send unapproved template: ${templateName}`;
        this.logger.warn(msg);
        throw new Error(msg);
    }

    try {
      const result = await this.provider.sendTemplateMessage(to, templateName, languageCode, components);
      const messageId = result.messages?.[0]?.id;

      // Cost Logging
      await this.logUsage(messageId, to, 'MARKETING', 0.50); // Dummy cost logic

      return result;
    } catch (e) {
      this.logger.error('Failed to send template message', e);
      throw e;
    }
  }

  async sendTextMessage(to: string, message: string) {
    try {
        const result = await this.provider.sendTextMessage(to, message);
        const messageId = result.messages?.[0]?.id;
        // Logging
        await this.logUsage(messageId, to, 'SERVICE', 0.30);
        return result;
    } catch(e) {
         this.logger.error('Failed to send text message', e);
         throw e;
    }
  }

  async sendPdfReceipt(to: string, pdfUrl: string, caption: string) {
    try {
        const result = await this.provider.sendMediaMessage(to, 'document', pdfUrl, caption);
        const messageId = result.messages?.[0]?.id;
        await this.logUsage(messageId, to, 'UTILITY', 0.40);
        return result;
    } catch(e) {
        this.logger.error('Failed to send PDF receipt', e);
        throw e;
    }
  }

  private async logUsage(messageId: string, to: string, category: string, cost: number) {
      if (!messageId) return;
      await this.prisma.whatsAppUsageLog.create({
          data: {
              messageId,
              recipientPhone: to,
              category,
              cost,
              status: 'SENT'
          }
      });
  }

  async updateMessageStatus(messageId: string, status: string) {
      const mappedStatus = status.toUpperCase();
      try {
          // messageId is not unique in schema, using updateMany
          await this.prisma.whatsAppUsageLog.updateMany({
              where: { messageId },
              data: { status: mappedStatus }
          });
          this.logger.log(`Updated status for message ${messageId} to ${mappedStatus}`);
      } catch (e) {
          this.logger.error(`Failed to update status for message ${messageId}`, e);
      }
  }

  async syncTemplates() {
      this.logger.log('Syncing templates from Meta...');
      try {
          const templates = await this.provider.getTemplates();
          for (const t of templates) {
              await this.prisma.whatsAppTemplate.upsert({
                  where: { templateName: t.name },
                  update: {
                      status: t.status,
                      bodyText: t.components?.find((c: any) => c.type === 'BODY')?.text || '',
                      languageCode: t.language,
                  },
                  create: {
                      templateName: t.name,
                      languageCode: t.language,
                      bodyText: t.components?.find((c: any) => c.type === 'BODY')?.text || '',
                      status: t.status,
                      parameterCount: 0 // Simplification
                  }
              });
          }
          this.logger.log(`Synced ${templates.length} templates.`);
      } catch (e) {
          this.logger.error('Failed to sync templates', e);
      }
  }

  // Step 5: Chat-to-Ticket Mapping Logic
  async handleIncomingMessage(senderPhone: string, messageBody: string) {
      this.logger.log(`Handling incoming message from ${senderPhone}: ${messageBody}`);

      // 1. Check if sender matches registered Parent (Guardian) or Student
      // Need to find user by phone.
      // Assuming User model has phone.
      const user = await this.prisma.user.findFirst({
          where: { phone: senderPhone },
          include: {
              student: true,
              guardian: true
          }
      });

      if (!user) {
          this.logger.warn(`Unknown sender: ${senderPhone}`);
          return;
      }

      let studentId = user.student?.id;
      let guardianId = user.guardian?.id;

      // 2. Check for existing OPEN ticket
      const whereConditions: any[] = [];
      if (studentId) whereConditions.push({ studentId });
      if (guardianId) whereConditions.push({ guardianId });

      if (whereConditions.length === 0) {
        this.logger.warn(`No valid student or guardian ID found for user with phone ${senderPhone}`);
        return;
      }

      const existingTicket = await this.prisma.ticket.findFirst({
          where: {
              OR: whereConditions,
              status: 'OPEN'
          }
      });

      if (existingTicket) {
          // 3. Append to TicketTimeline
          await this.prisma.ticketTimeline.create({
              data: {
                  ticketId: existingTicket.id,
                  message: messageBody,
                  source: 'USER'
              }
          });
          this.logger.log(`Appended message to Ticket ${existingTicket.id}`);
      } else {
          // 4. Auto-Create new Ticket
          const newTicket = await this.prisma.ticket.create({
              data: {
                  studentId,
                  guardianId,
                  status: 'OPEN',
                  category: 'General',
                  source: 'WHATSAPP',
                  timelines: {
                      create: {
                          message: messageBody,
                          source: 'USER'
                      }
                  }
              }
          });
           this.logger.log(`Created new Ticket ${newTicket.id}`);
      }
  }

  // Step 7: Welcome Automation
  @OnEvent('student.admission_confirmed')
  async handleStudentAdmission(payload: { studentId: string; parentPhone: string; parentName: string; studentName: string }) {
      this.logger.log(`Sending welcome message to ${payload.parentPhone}`);
      const loginUrl = 'https://school.app/login'; // Env var in real app

      const components = [
          {
              type: 'body',
              parameters: [
                  { type: 'text', text: payload.parentName },
                  { type: 'text', text: payload.studentName },
                  { type: 'text', text: loginUrl }
              ]
          }
      ];

      await this.sendTemplateMessage(payload.parentPhone, 'welcome_pack', 'en_US', components);
  }

  // Step 8: Absent Alert Automation
  @OnEvent('attendance.marked_absent')
  async handleAbsentAlert(payload: { studentId: string; parentPhone: string; parentName: string; studentName: string }) {
      this.logger.log(`Sending absent alert to ${payload.parentPhone}`);

       const components = [
          {
              type: 'body',
              parameters: [
                  { type: 'text', text: payload.parentName },
                  { type: 'text', text: payload.studentName }
              ]
          }
      ];

      await this.sendTemplateMessage(payload.parentPhone, 'absent_alert_v1', 'en_US', components);
  }
}
