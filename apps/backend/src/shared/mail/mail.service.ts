import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendEmail(to: string, subject: string, content: string) {
    this.logger.log(`Sending email to ${to}: ${subject} - ${content}`);
    return Promise.resolve(true);
  }
}
