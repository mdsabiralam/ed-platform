import { Injectable } from '@nestjs/common';

@Injectable()
export class PlagiarismCheckService {
  checkSimilarity(text: string): number {
    // Mock implementation: returns a random percentage between 0 and 20.
    const score = Math.random() * 20;
    return parseFloat(score.toFixed(2));
  }
}
