import { Controller, Post, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubstitutionService } from '../services/substitution.service';
import { PrismaService } from '../../prisma/prisma.service';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignSubstitutionDto {
  @IsUUID()
  @IsNotEmpty()
  substitutionId: string;

  @IsUUID()
  @IsNotEmpty()
  substituteTeacherId: string;
}

@Controller('api/academic/substitution')
export class SubstitutionController {
  constructor(
    private readonly substitutionService: SubstitutionService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('assign')
  async assignSubstitution(@Body() dto: AssignSubstitutionDto) {
    const { substitutionId, substituteTeacherId } = dto;

    // 1. Fetch RoutineSubstitution
    const substitution = await this.prisma.routineSubstitution.findUnique({
      where: { id: substitutionId },
      include: { routineEntry: true },
    });

    if (!substitution) {
      throw new NotFoundException('Substitution record not found');
    }

    if (substitution.status !== 'PENDING') {
      throw new BadRequestException('Substitution is not in PENDING status');
    }

    // 2. Validate Substitute Availability
    const availableTeachers = await this.substitutionService.findAvailableTeachers(
      substitution.routineEntryId,
      substitution.date,
    );

    const isAvailable = availableTeachers.some((t) => t.id === substituteTeacherId);

    if (!isAvailable) {
      throw new BadRequestException('The selected substitute teacher is not available for this slot.');
    }

    // 3. Update Substitution Record
    const updatedSubstitution = await this.prisma.routineSubstitution.update({
      where: { id: substitutionId },
      data: {
        substituteTeacherId: substituteTeacherId,
        status: 'ASSIGNED',
      },
    });

    // 4. Emit Event
    this.eventEmitter.emit('substitution.assigned', updatedSubstitution);

    return updatedSubstitution;
  }
}
