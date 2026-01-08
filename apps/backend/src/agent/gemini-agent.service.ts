import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AssignmentService } from '../assignment/assignment.service';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeminiAgentService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly logger = new Logger(GeminiAgentService.name);

  constructor(
    private configService: ConfigService,
    private assignmentService: AssignmentService,
    private notificationService: NotificationService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'mock-key';
    this.genAI = new GoogleGenerativeAI(apiKey);

    const tools: any = [
      {
        functionDeclarations: [
          {
            name: "create_assignment",
            description: "Create a new assignment for a class.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                classId: { type: SchemaType.STRING, description: "The ID of the class" },
                subject: { type: SchemaType.STRING, description: "The subject name (e.g. Math, Physics)" },
                topic: { type: SchemaType.STRING, description: "The topic being covered" },
                questions: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: "List of generated questions"
                },
              },
              required: ["classId", "subject", "topic", "questions"],
            },
          },
          {
            name: "send_notification",
            description: "Send a notification to students.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                studentIds: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: "List of student IDs"
                },
                message: { type: SchemaType.STRING, description: "The message content" },
              },
              required: ["studentIds", "message"],
            },
          },
        ],
      },
    ];

    this.model = this.genAI.getGenerativeModel({
        model: "gemini-pro",
        tools: tools,
    });
  }

  async processQuery(userQuery: string, instituteId: string) {
    // 1. RAG Integration (Mocked or Basic Search)
    const context = await this.retrieveContext(userQuery, instituteId);

    const prompt = `
      Context: ${context}
      User Request: ${userQuery}

      If the request requires an action, call the appropriate tool.
    `;

    try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        // Handle both possible tool call structures depending on SDK version
        const functionCalls = response.functionCalls ? response.functionCalls() : [];

        if (functionCalls && functionCalls.length > 0) {
            const executionResults: any[] = [];
            for (const call of functionCalls) {
                const args = call.args;
                this.logger.log(`Executing tool: ${call.name} with args: ${JSON.stringify(args)}`);

                let output;
                if (call.name === 'create_assignment') {
                    // Combine detailed args into the generic Assignment fields
                    const combinedDescription = `Subject: ${args.subject}\nTopic: ${args.topic}\n\nQuestions:\n${(args.questions || []).map((q, i) => `${i+1}. ${q}`).join('\n')}`;

                    output = await this.assignmentService.createFromRequest(
                        'agent-generated',
                        {
                            title: `${args.subject} - ${args.topic}`,
                            description: combinedDescription,
                            classId: args.classId,
                            dueDate: new Date(Date.now() + 7 * 86400000).toISOString()
                        },
                        instituteId
                    );
                } else if (call.name === 'send_notification') {
                    output = await this.notificationService.sendBulkNotification(
                        args.studentIds || [],
                        args.message,
                        'AI Agent'
                    );
                }
                executionResults.push({ tool: call.name, output });
            }
            return { type: 'action', results: executionResults };
        }

        return { type: 'text', content: response.text() };

    } catch (error) {
        this.logger.error('Gemini Agent Error', error);
        return { type: 'error', message: 'Failed to process request' };
    }
  }

  private async retrieveContext(query: string, instituteId: string) {
    // Mock RAG
    return "Syllabus for Class 10 includes Physics Chapter 5: Newton's Laws.";
  }
}
