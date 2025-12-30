import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LiveClassGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const routineId = request.params.id; // from GET /:id/join
    const userId = request.headers['x-user-id'];
    const role = request.headers['x-role'];

    if (!routineId) throw new BadRequestException('Routine ID required');

    const routine = await this.prisma.routineEntry.findUnique({
      where: { id: routineId },
    });

    if (!routine) throw new NotFoundException('Routine not found');
    if (!routine.isLive && role !== 'PRINCIPAL') { // Principals can join anytime or check
         // If "isLive" check is strict for everyone, uncomment below:
         // throw new BadRequestException('Class is not live');
         // But prompt says "returns URL if...".
         // The controller logic had "if !isLive throw".
         // Guard should probably handle Auth/Authz primarily.
    }

    // Attach routine to request for controller to use
    request.routine = routine;

    if (role === 'PRINCIPAL') {
      return true;
    }

    if (role === 'STUDENT') {
      if (!userId) throw new ForbiddenException('User ID required');

      const student = await this.prisma.student.findUnique({
        where: { id: userId },
      });

      if (!student) throw new ForbiddenException('Student not found');

      if (student.sectionId !== routine.sectionId) {
        throw new ForbiddenException('You are not enrolled in this section');
      }

      return true;
    }

    throw new ForbiddenException('Unauthorized role');
  }
}
