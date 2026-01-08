import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async gradeAssignment(submissionImageUrl: string, referenceAnswer: string) {
    // Mock GPT-4 Vision response
    // In production, this would use OpenAI API with the image URL
    console.log(`[AI] Analyzing ${submissionImageUrl} against reference: ${referenceAnswer}`);

    // Simulating API latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      obtainedMarks: 8.5,
      totalMarks: 10,
      remarks: "Good attempt. The diagram on page 2 is well drawn, but the explanation of photosynthesis lacks the mention of ATP production explicitly. Handwriting is clear.",
      gradedAt: new Date()
    };
  }
}
