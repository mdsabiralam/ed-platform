import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async uploadFile(path: string, buffer: Buffer): Promise<string> {
    // Mock upload to S3/Supabase
    // Return a mock URL
    return `https://mock-storage.com/${path}`;
  }
}
