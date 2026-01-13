import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InstituteService } from './institute.service';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstituteController {
  constructor(private readonly instituteService: InstituteService) {}

  @Post('onboarding')
  @Roles(UserRole.SUPER_ADMIN)
  async onboard(@Body() createInstituteDto: CreateInstituteDto) {
    return this.instituteService.create(createInstituteDto);
  }
}
