import { Injectable } from '@nestjs/common';

@Injectable()
export class LibraryService {
  async checkLibraryDues(studentId: string): Promise<boolean> {
    // Mock implementation: always return true for now
    return true;
  }
}
