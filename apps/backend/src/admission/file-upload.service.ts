import { Injectable, BadRequestException } from '@nestjs/common';
// import * as AWS from 'aws-sdk'; // Assuming AWS SDK is available or we use a mock
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {}

  // 4.B.05
  async uploadFile(file: Express.Multer.File): Promise<{ signedUrl: string, fileUrl: string }> {
     // Validate MIME type
     const allowedMimeTypes = ['image/jpeg', 'application/pdf'];
     if (!allowedMimeTypes.includes(file.mimetype)) {
         throw new BadRequestException('Invalid file type. Only JPEG and PDF are allowed.');
     }

     // Upload to S3/Storage (Mock implementation for this environment as I don't have AWS creds)
     // In a real scenario:
     /*
     const s3 = new AWS.S3();
     const uploadResult = await s3.upload({
         Bucket: this.configService.get('AWS_BUCKET_NAME'),
         Key: `admission/${Date.now()}-${file.originalname}`,
         Body: file.buffer,
         ContentType: file.mimetype,
         ACL: 'public-read' // or signed url
     }).promise();
     */

     // Returning a mock URL and signed URL
     const mockUrl = `https://storage.example.com/admission/${Date.now()}-${file.originalname}`;
     return {
         fileUrl: mockUrl,
         signedUrl: mockUrl + '?token=signed-token-mock'
     };
  }
}
