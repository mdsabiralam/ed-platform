
export interface IWhatsAppProvider {
  sendTextMessage(to: string, message: string): Promise<any>;
  sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[]
  ): Promise<any>;
  sendMediaMessage(
    to: string,
    type: 'image' | 'document' | 'video',
    url: string,
    caption?: string
  ): Promise<any>;
  getTemplates(): Promise<any[]>;
}
