import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueryBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async generateCustomReport(selectColumns: string[], tableName: string): Promise<any[]> {
    // Basic Sanitization
    const allowedTables = ['student', 'fees', 'attendance', 'marks']; // Whitelist
    if (!allowedTables.includes(tableName)) {
      throw new BadRequestException('Invalid table name');
    }

    const sanitizedColumns = selectColumns.map(col => {
        if (!/^[a-zA-Z0-9_]+$/.test(col)) {
             throw new BadRequestException(`Invalid column name: ${col}`);
        }
        // PII Check
        const piiColumns = ['password', 'hash', 'salt', 'socialSecurityNumber', 'phoneNumber', 'email'];
        if (piiColumns.some(pii => col.toLowerCase().includes(pii.toLowerCase()))) {
             throw new BadRequestException(`Cannot access PII column: ${col}`);
        }
        return `"${col}"`;
    });

    if (sanitizedColumns.length === 0) {
        throw new BadRequestException('No columns specified');
    }

    const query = `SELECT ${sanitizedColumns.join(', ')} FROM "${tableName}" LIMIT 1000`;

    // Execute safe query using Prisma raw query
    // Note: Prisma.$queryRawUnsafe is used here because we've manually sanitized the input against a strict whitelist/regex
    // In a real scenario, building a dynamic query object for Prisma would be safer if possible, but for dynamic column selection on arbitrary tables, raw might be needed or dynamic select object construction.

    // For safety demonstration, we use queryRawUnsafe but relying on our strict checks above.
    return this.prisma.$queryRawUnsafe(query);
  }
}
