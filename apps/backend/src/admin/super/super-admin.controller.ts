import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminIpGuard } from '../../common/guards/admin-ip.guard';

@Controller('admin/super')
@UseGuards(AdminIpGuard)
export class SuperAdminController {

  @Get('dashboard')
  getDashboard() {
    return { message: 'Welcome Super Admin' };
  }
}
