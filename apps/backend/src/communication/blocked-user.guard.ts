import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlockedUserGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
        // If no user, maybe allow or deny depending on endpoint.
        // Assuming protected routes.
        return true;
    }

    // Check if user is blocked
    // Ideally user is fetched with full details or we query DB
    const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { isBlockedByStaff: true }
    });

    if (dbUser?.isBlockedByStaff) {
        // Check if the request is "Read-Only".
        // Prompt 2: "Blocked users can only send 'Read-Only' queries, no new chats."
        // We can check the HTTP method. GET is usually read-only.
        // POST/PUT/DELETE are modifying.
        if (request.method !== 'GET') {
             throw new ForbiddenException('Your account is blocked from sending messages or making changes.');
        }
    }

    return true;
  }
}
