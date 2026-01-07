
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SocialService {
  private baseUrl: string;

  constructor(private configService: ConfigService) {
      this.baseUrl = this.configService.get<string>('NEXT_PUBLIC_API_URL') || 'https://school.edu';
  }

  generateOgImage(studentName: string): string {
    return `${this.baseUrl}/og?name=${encodeURIComponent(studentName)}`;
  }

  createShareLink(studentId: string): string {
    return `${this.baseUrl}/r/${studentId}`;
  }
}
