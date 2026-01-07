import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';

@ApiTags('HR - Staff')
@Controller('api/hr/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('onboard')
  @ApiOperation({ summary: 'Onboard new staff member (Transactional)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async onboardStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.onboardStaff(createStaffDto);
  }

  @Get('directory')
  @ApiOperation({ summary: 'Get staff directory with filters' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'is_teaching', required: false, type: Boolean })
  @UseGuards(JwtAuthGuard)
  async getStaffDirectory(
    @Query('department') department?: string,
    @Query('is_teaching') isTeaching?: string,
  ) {
    const isTeachingBool = isTeaching === 'true' ? true : isTeaching === 'false' ? false : undefined;
    return this.staffService.getStaffDirectory(department, isTeachingBool);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current logged in staff profile' })
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() req: any) {
    // Assuming req.user is populated by AuthGuard
    // For now, we might need to mock or assume user ID is passed or available
    const userId = req.user?.id;
    if (!userId) {
       // Fallback for development/testing if AuthGuard is not active in this context
       // In production this should be 401
       throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.staffService.getStaffProfileByUserId(userId);
  }
}
