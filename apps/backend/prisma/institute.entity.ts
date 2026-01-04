import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../src/common/entities/base.entity';

export class Institute extends BaseEntity {
  @ApiProperty()
  name: string;
  @ApiProperty()
  subdomain: string;
}
