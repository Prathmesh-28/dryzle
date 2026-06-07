import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getUsers(@Query('page') page = 1, @Query('role') role?: Role) {
    return this.adminService.getUsers(+page, role);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Get('vendors')
  getVendors(
    @Query('page') page = 1,
    @Query('approved') approved?: string,
  ) {
    const approvedFilter = approved !== undefined ? approved === 'true' : undefined;
    return this.adminService.getVendors(+page, approvedFilter);
  }

  @Patch('vendors/:id/approve')
  approveVendor(@Param('id') id: string) {
    return this.adminService.approveVendor(id);
  }

  @Patch('vendors/:id/suspend')
  suspendVendor(@Param('id') id: string) {
    return this.adminService.suspendVendor(id);
  }

  @Get('delivery-boys')
  getDeliveryBoys(@Query('page') page = 1) {
    return this.adminService.getDeliveryBoys(+page);
  }

  @Patch('delivery-boys/:id/approve')
  approveDeliveryBoy(@Param('id') id: string) {
    return this.adminService.approveDeliveryBoy(id);
  }

  @Get('orders')
  getOrders(
    @Query('page') page = 1,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.adminService.getOrders(+page, status, date);
  }

  @Post('orders/:id/reassign')
  reassignDeliveryBoy(
    @Param('id') id: string,
    @Body('deliveryBoyId') deliveryBoyId: string,
  ) {
    return this.adminService.reassignDeliveryBoy(id, deliveryBoyId);
  }

  @Post('notifications/broadcast')
  broadcast(@Body() body: { title: string; body: string; role?: Role }) {
    return this.adminService.broadcastNotification(body.title, body.body, body.role);
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() body: Record<string, unknown>) {
    return this.adminService.updateSettings(body);
  }
}
