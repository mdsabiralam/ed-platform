import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class MarksheetGeneratorService {
  async generatePdf(studentId: string): Promise<Readable> {
    // Mock implementation returning a stream
    const stream = new Readable();
    stream.push('PDF Content Placeholder');
    stream.push(null);
    return stream;
  }
}
