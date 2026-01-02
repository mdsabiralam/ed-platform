import { Injectable } from '@nestjs/common';
import { ResultService } from '../academic/results/result.service';

@Injectable()
export class LibraryService {
  constructor(private readonly resultService: ResultService) {}

  async checkLibraryDues(studentId: string): Promise<boolean | string> {
    return this.resultService.checkLibraryDues(studentId);
  }
}
