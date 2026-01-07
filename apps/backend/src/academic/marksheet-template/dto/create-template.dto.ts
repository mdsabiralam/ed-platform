import { IsString, IsNotEmpty, IsObject, IsBoolean, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class HeaderConfig {
  @IsBoolean()
  show_logo: boolean;

  @IsNumber()
  school_name_font_size: number;

  @IsNumber()
  @IsOptional()
  x: number;

  @IsNumber()
  @IsOptional()
  y: number;

  @IsNumber()
  @IsOptional()
  width: number;

  @IsNumber()
  @IsOptional()
  height: number;
}

class MarksTableConfig {
  @IsArray()
  @IsString({ each: true })
  columns: string[];

  @IsBoolean()
  show_attendance: boolean;

  @IsNumber()
  @IsOptional()
  x: number;

  @IsNumber()
  @IsOptional()
  y: number;

  @IsNumber()
  @IsOptional()
  width: number;

  @IsNumber()
  @IsOptional()
  height: number;
}

class FooterConfig {
  @IsBoolean()
  show_principal_signature: boolean;

  @IsString()
  disclaimer_text: string;

  @IsNumber()
  @IsOptional()
  x: number;

  @IsNumber()
  @IsOptional()
  y: number;

  @IsNumber()
  @IsOptional()
  width: number;

  @IsNumber()
  @IsOptional()
  height: number;
}

class LayoutConfig {
  @IsObject()
  @ValidateNested()
  @Type(() => HeaderConfig)
  header: HeaderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => MarksTableConfig)
  marks_table: MarksTableConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => FooterConfig)
  footer: FooterConfig;
}

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LayoutConfig)
  layout_config: LayoutConfig;
}
