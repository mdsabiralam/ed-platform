import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { ResourceType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLearningResourceDto {
  @ApiProperty({ example: 'Introduction to Algebra' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A comprehensive guide to basic algebra', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ResourceType, example: ResourceType.VIDEO })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;

  @ApiProperty({ example: 'https://example.com/video.mp4', required: false })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiProperty({ example: 'https://example.com/thumbnail.jpg', required: false })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: 'uuid-chapter-id' })
  @IsUUID()
  @IsNotEmpty()
  chapterId: string;

  @ApiProperty({ example: 'uuid-topic-id' })
  @IsUUID()
  @IsNotEmpty()
  topicId: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
