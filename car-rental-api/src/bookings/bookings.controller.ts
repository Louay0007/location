import {
  Controller, Get, Post, Put, Patch, Body, Param,
  UseGuards, Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createBooking(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(user.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyBookings(@CurrentUser() user: any, @Query() dto: FilterBookingsDto) {
    return this.bookingsService.getMyBookings(user.id, dto);
  }

  @Get('my/:id')
  @UseGuards(JwtAuthGuard)
  getMyBookingById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.getMyBookingById(user.id, parseInt(id));
  }

  @Post('my/:id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelMyBooking(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.cancelMyBooking(user.id, parseInt(id));
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllBookings(@Query() dto: FilterBookingsDto) {
    return this.bookingsService.getAllBookings(dto);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getBookingById(@Param('id') id: string) {
    return this.bookingsService.getBookingById(parseInt(id));
  }

  @Post('admin/:id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  confirmBooking(@Param('id') id: string) {
    return this.bookingsService.confirmBooking(parseInt(id));
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateBookingStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.bookingsService.updateBookingStatus(parseInt(id), body.status);
  }
}