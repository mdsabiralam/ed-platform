import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ParentService } from './parent.service';

@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('children')
  async getChildren(@Headers('x-user-id') userId: string) {
    if (!userId) {
      // For testing purposes, we might default to a seed user or throw
      throw new UnauthorizedException('User ID header required');
    }
    return this.parentService.getChildren(userId);
  }
}
