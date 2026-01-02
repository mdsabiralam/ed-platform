import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Question } from '@prisma/client';

@Injectable()
export class QuestionPaperPdfService {
  constructor(private prisma: PrismaService) {}

  private async fetchPaperData(paperId: string) {
    const paper = await this.prisma.generatedPaper.findUnique({
      where: { id: paperId },
      include: {
        class: true,
        blueprint: {
            include: {
                subject: true
            }
        },
      },
    });

    if (!paper) {
      throw new NotFoundException('Generated Paper not found');
    }

    const questionIds = (paper.questionsJson as unknown as string[]) || [];

    // Fetch questions maintaining order if possible, or reorder manually
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    // Reorder questions to match the array order in JSON
    const orderedQuestions = questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => !!q);

    return { paper, questions: orderedQuestions };
  }

  async generateStudentCopy(paperId: string): Promise<Buffer> {
    const { paper, questions } = await this.fetchPaperData(paperId);
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let y = height - 50;
    const margin = 50;

    // Header
    const schoolName = 'School Name Here'; // Ideally fetched from Tenant context if available
    const title = `${paper.blueprint.name} - ${paper.class.name}`;
    const subTitle = `Subject: ${paper.blueprint.subject.name} | Date: ${paper.examDate.toISOString().split('T')[0]}`;

    page.drawText(schoolName, { x: margin, y, size: 20, font: timesRomanFont });
    y -= 25;
    page.drawText(title, { x: margin, y, size: 16, font: timesRomanFont });
    y -= 20;
    page.drawText(subTitle, { x: margin, y, size: 12, font: timesRomanFont });
    y -= 40;

    // Questions
    for (const [index, question] of questions.entries()) {
        const questionText = `${index + 1}. ${question.content} (${question.marks} Marks)`;

        // Basic wrapping logic could be added here, simplified for now
        // Assuming content fits or we just let it overflow for MVP

        if (y < 50) {
            page = pdfDoc.addPage();
            y = height - 50;
        }

        page.drawText(questionText, { x: margin, y, size: 12, font: timesRomanFont });
        y -= 20;

        // If MCQ, list options
        if (question.type === 'MCQ' && question.options) {
            const options = question.options as any; // Assuming array or object
            if (Array.isArray(options)) {
                 for (const opt of options) {
                    if (y < 50) { page = pdfDoc.addPage(); y = height - 50; }
                    page.drawText(`   - ${opt}`, { x: margin + 10, y, size: 11, font: timesRomanFont });
                    y -= 15;
                 }
            }
        }
        y -= 10; // Extra spacing
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async generateTeacherCopy(paperId: string): Promise<Buffer> {
    const { paper, questions } = await this.fetchPaperData(paperId);
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let y = height - 50;
    const margin = 50;

    // Header
    const headerText = `TEACHER COPY (ANSWER KEY) - ${paper.blueprint.name}`;
    page.drawText(headerText, { x: margin, y, size: 18, font: timesBoldFont, color: rgb(1, 0, 0) });
    y -= 40;

    // Questions with Answers
    for (const [index, question] of questions.entries()) {
        const questionText = `${index + 1}. ${question.content} (${question.marks} Marks)`;

        if (y < 50) {
            page = pdfDoc.addPage();
            y = height - 50;
        }

        page.drawText(questionText, { x: margin, y, size: 12, font: timesRomanFont });
        y -= 20;

        // Answer
        if (question.correctAnswer) {
             const answerText = `Answer: ${question.correctAnswer}`;
             page.drawText(answerText, { x: margin + 10, y, size: 12, font: timesBoldFont, color: rgb(1, 0, 0) });
             y -= 20;
        } else {
             // If no explicit answer field for non-MCQ, maybe print "Check Rubric"
             page.drawText("Answer Key: [Check Rubric]", { x: margin + 10, y, size: 11, font: timesBoldFont, color: rgb(0.5, 0.5, 0.5) });
             y -= 20;
        }

        y -= 10;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
