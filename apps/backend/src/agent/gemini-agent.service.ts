import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiAgentService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'mock-key';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateContent(instructions: string): Promise<any> {
    if (!instructions) return {};

    const prompt = `
      Based on the following instructions, generate a structured assignment.
      Instructions: "${instructions}"

      Return ONLY a JSON object with this structure:
      {
        "title": "Assignment Title",
        "description": "Short description",
        "questions": ["Question 1", "Question 2", ...]
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // Basic cleanup for JSON parsing if markdown blocks are used
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback mock response if API fails or key is invalid
      return {
        title: 'Generated Assignment',
        description: 'Auto-generated based on instructions.',
        questions: ['Question 1', 'Question 2', 'Question 3'],
      };
    }
  }
}
