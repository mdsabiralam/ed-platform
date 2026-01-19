import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {

  async generateLessonPlan(topic: string) {
    // Simulate AI Latency
    // await new Promise(r => setTimeout(r, 100));

    // Mock Response mimicking a structured LLM output
    return {
      topic: topic,
      duration: '45 Minutes',
      learningOutcomes: [
        `Understand the core concepts of ${topic}`,
        `Apply ${topic} to real-world scenarios`,
        `Analyze problems using the principles of ${topic}`
      ],
      structure: [
        {
          phase: 'Introduction (5 mins)',
          activity: 'Hook the students with a relevant question or video.'
        },
        {
          phase: 'Main Activity (30 mins)',
          activity: 'Interactive lecture and group problem solving.'
        },
        {
          phase: 'Conclusion (10 mins)',
          activity: 'Recap and exit ticket quiz.'
        }
      ],
      resources: [
        'Textbook Chapter 5',
        'YouTube Explainer Video'
      ]
    };
  }
}
