import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../src/prisma/base.entity';

export class Tenant extends BaseEntity {
  @ApiProperty()
  name: string;
  @ApiProperty()
  subdomain: string;
}
