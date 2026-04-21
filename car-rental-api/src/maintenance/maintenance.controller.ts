import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  getAllMaintenanceRecords(@Query('vehicleId') vehicleId?: string) {
    return this.maintenanceService.getAllMaintenanceRecords(vehicleId ? parseInt(vehicleId) : undefined);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/alerts')
  getMaintenanceAlerts() {
    return this.maintenanceService.getMaintenanceAlerts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/upcoming')
  getUpcomingMaintenance(@Query('days') days?: string) {
    return this.maintenanceService.getUpcomingMaintenance(days ? parseInt(days) : 7);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/overdue')
  getOverdueMaintenance() {
    return this.maintenanceService.getOverdueMaintenance();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/vehicle/:id')
  getVehicleMaintenanceHistory(@Param('id') id: string) {
    return this.maintenanceService.getVehicleMaintenanceHistory(parseInt(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id')
  getMaintenanceRecordById(@Param('id') id: string) {
    return this.maintenanceService.getMaintenanceRecordById(parseInt(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin')
  createMaintenanceRecord(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.createMaintenanceRecord(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('admin/:id')
  updateMaintenanceRecord(@Param('id') id: string, @Body() dto: Partial<CreateMaintenanceDto>) {
    return this.maintenanceService.updateMaintenanceRecord(parseInt(id), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/:id')
  deleteMaintenanceRecord(@Param('id') id: string) {
    return this.maintenanceService.deleteMaintenanceRecord(parseInt(id));
  }
}