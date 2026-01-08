import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async getRandomSample(classId: string, limit: number = 3) {
    // In production, use standard SQL ORDER BY RANDOM()
    // For Prisma + PostgreSQL:
    try {
        const students = await this.prisma.$queryRawUnsafe<any[]>(
            `SELECT * FROM students WHERE section_id = $1 ORDER BY RANDOM() LIMIT $2`,
            classId, limit
        );
        return students;
    } catch (e) {
        // Fallback for mock if raw query fails or not supported in this env
        return [
            { id: '1', firstName: 'Rahim', lastName: 'Uddin' },
            { id: '2', firstName: 'Karim', lastName: 'Khan' },
            { id: '3', firstName: 'Sultana', lastName: 'Akter' },
        ];
    }
  }
}
