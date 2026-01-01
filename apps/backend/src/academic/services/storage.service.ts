import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async uploadFile(file: any): Promise<string> {
    // Simulate upload to S3/Supabase
    // Returns a dummy public URL
    return `https://via.placeholder.com/600x800.png?text=Background+${file?.originalname || 'Image'}`;
  }
}
