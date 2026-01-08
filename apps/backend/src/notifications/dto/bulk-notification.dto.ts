import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class BulkNotificationDto {
    @IsArray()
    @IsString({ each: true })
    userIds: string[];

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsOptional()
    senderId?: string;
}
