import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationTemplateService {
  constructor(private prisma: PrismaService) {}

  replaceVariables(template: string, user: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      // Basic implementation for flat object.
      // If user has nested objects (like student.firstName), this regex needs to be smarter or we flatten the user object.
      // For simplicity, we assume flattened keys or top level keys.
      // Or we can handle simple dot notation manually.
      if (key.includes('.')) {
          const keys = key.split('.');
          let value = user;
          for (const k of keys) {
              value = value ? value[k] : undefined;
          }
          return value || match;
      }
      return user[key] || match;
    });
  }
}
