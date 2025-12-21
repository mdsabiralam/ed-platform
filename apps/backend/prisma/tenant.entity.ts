import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';

export class Tenant extends BaseEntity {
  @ApiProperty()
  name: string;
  @ApiProperty()
  subdomain: string;
}