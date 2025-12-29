import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsObject, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '../interfaces/timetable.interface';

class TimetableSettingsDto {
  @IsBoolean()
  freezeLunchBreak: boolean;

  @IsBoolean()
  allowDoubleBlocks: boolean;
}

export class GenerateTimetableDto {
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  sectionIds: string[];

  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  @IsNotEmpty()
  workDays: DayOfWeek[];

  @IsInt()
  @IsNotEmpty()
  totalPeriods: number;

  @IsObject()
  @ValidateNested()
  @Type(() => TimetableSettingsDto)
  @IsNotEmpty()
  settings: TimetableSettingsDto;
}
