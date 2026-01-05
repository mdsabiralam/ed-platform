import { BaseEntity } from '../src/common/entities/base.entity';

export class Tenant extends BaseEntity {
  name: string;
  subdomain: string;
  logoUrl?: string;
  isActive: boolean;
  subscriptionStatus: string;
}
