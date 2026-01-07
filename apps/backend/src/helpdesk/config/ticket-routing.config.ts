import { TicketCategory, UserRole } from '@prisma/client';

export const TicketRoutingConfig: Record<string, UserRole> = {
  [TicketCategory.TRANSPORT]: UserRole.TRANSPORT_MANAGER,
  [TicketCategory.ACCOUNTS]: UserRole.ACCOUNTANT,
  [TicketCategory.ACADEMIC]: UserRole.TEACHER,
};
