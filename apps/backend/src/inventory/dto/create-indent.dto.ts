import { IsArray, IsString } from 'class-validator';

export class CreateIndentDto {
  @IsArray()
  items: any[]; // Or define a specific structure
}
