import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBlueprintDto } from './dto/create-blueprint.dto';

@ApiTags('Academic - Blueprint')
@Controller('academic/blueprint')
export class BlueprintController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a Question Blueprint' })
  @ApiResponse({ status: 201, description: 'Blueprint created.' })
  async create(@Body() dto: CreateBlueprintDto) {
    return this.prisma.questionBlueprint.create({
      data: {
        name: dto.name,
        subjectId: dto.subjectId,
        totalMarks: dto.totalMarks,
        durationMinutes: dto.durationMinutes,
        structure: dto.structure as any, // Cast to JSON
        difficultyDistribution: dto.difficultyDistribution as any, // Cast to JSON
      },
    });
  }
}
