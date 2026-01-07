
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IWhatsAppProvider } from '../interfaces/whatsapp-provider.interface';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class MetaWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);
  private readonly baseUrl = 'https://graph.facebook.com/v17.0';
  private accessToken: string;
  private phoneNumberId: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || '';
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async sendTextMessage(to: string, message: string): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    };

    try {
      const response = await axios.post(url, data, { headers: this.headers });
      return response.data;
    } catch (error) {
      this.logger.error(`Error sending text message: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[]
  ): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    };

    try {
      const response = await axios.post(url, data, { headers: this.headers });
      return response.data;
    } catch (error) {
      this.logger.error(`Error sending template message: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async sendMediaMessage(
    to: string,
    type: 'image' | 'document' | 'video',
    fileUrl: string,
    caption?: string
  ): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    const data: any = {
      messaging_product: 'whatsapp',
      to,
      type: type,
    };

    data[type] = {
      link: fileUrl,
    };

    if (caption) {
        data[type].caption = caption;
    }

    // Note: Meta API requires either ID (after upload) or link. Using link for simplicity as per prompt.
    // "The method should accept a fileUrl (S3 link) ... or send a public URL directly."

    try {
      const response = await axios.post(url, data, { headers: this.headers });
      return response.data;
    } catch (error) {
       this.logger.error(`Error sending media message: ${error.message}`, error.response?.data);
       throw error;
    }
  }

  async getTemplates(): Promise<any[]> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/message_templates`;
    try {
      const response = await axios.get(url, { headers: this.headers });
      return response.data.data;
    } catch (error) {
      this.logger.error(`Error fetching templates: ${error.message}`, error.response?.data);
      throw error;
    }
  }
}
