import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Smart Marketplace Logic:
   * 1. Get student profile (class, section).
   * 2. Determine target grade from class name (e.g. "Grade 5" -> "5").
   * 3. Fetch products and bundles matching that grade and board.
   */
  async getRecommendations(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        section: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!student) throw new NotFoundException('Student not found');

    const className = student.section?.class?.name || '';
    // Heuristic: Extract number from "Grade 5" or "Class 10"
    const gradeMatch = className.match(/\d+/);
    const gradeLevel = gradeMatch ? gradeMatch[0] : null;

    // TODO: Determine board from Curriculum or elsewhere. Assuming generic or stored in Section/Class.
    // For now, we search by gradeLevel.

    const products = await this.prisma.ecommerceProduct.findMany({
      where: {
        gradeLevel: gradeLevel,
        // board: 'CBSE' // ideally fetched from student profile
      },
      include: {
        variants: true,
      },
    });

    const bundles = await this.prisma.curatedBundle.findMany({
      where: {
        targetGrade: gradeLevel,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return {
      studentProfile: {
        grade: gradeLevel,
        className: className,
      },
      recommendedProducts: products,
      recommendedBundles: bundles,
    };
  }
}
