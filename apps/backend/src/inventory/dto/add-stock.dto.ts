import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class AddStockDto {
  @IsString()
  itemId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number; // Cost of the new stock batch
}
