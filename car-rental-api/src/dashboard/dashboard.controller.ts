import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/kpis')
  getKPIs() {
    return this.dashboardService.getKPIs();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/revenue')
  getRevenueByMonth(@Query('months') months?: string) {
    return this.dashboardService.getRevenueByMonth(months ? parseInt(months) : 12);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/bookings-status')
  getBookingsByStatus() {
    return this.dashboardService.getBookingsByStatus();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/fleet-occupation')
  getFleetOccupancy(@Query('days') days?: string) {
    return this.dashboardService.getFleetOccupancy(days ? parseInt(days) : 30);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/top-vehicles')
  getTopVehicles(@Query('limit') limit?: string) {
    return this.dashboardService.getTopVehicles(limit ? parseInt(limit) : 5);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/payment-methods')
  getPaymentMethodsDistribution() {
    return this.dashboardService.getPaymentMethodsDistribution();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/recent-bookings')
  getRecentBookings(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentBookings(limit ? parseInt(limit) : 10);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/maintenance-stats')
  getMaintenanceStats() {
    return this.dashboardService.getMaintenanceStats();
  }
}