import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { differenceInDays } from 'date-fns';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private generateReference(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `REF-${year}-${random}`;
  }

  async createBooking(userId: number, dto: CreateBookingDto) {
    const { vehicleId, startDate, endDate } = dto;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');
    if (vehicle.status !== 'AVAILABLE') {
      throw new ConflictException('Ce véhicule n\'est pas disponible');
    }

    const overlapping = await this.prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { lt: end },
        endDate: { gt: start },
      },
    });

    if (overlapping) {
      throw new ConflictException('Ce véhicule est déjà réservé pour ces dates');
    }

    const durationDays = differenceInDays(end, start) + 1;

    const priceRules = await this.prisma.priceRule.findMany({
      where: { isActive: true },
    });

    const pricing = this.calculatePrice(vehicle.dailyRate, durationDays, priceRules, start);

    const bookingReference = this.generateReference();

    const booking = await this.prisma.booking.create({
      data: {
        bookingReference,
        clientId: userId,
        vehicleId,
        startDate: start,
        endDate: end,
        pickupTime: dto.pickupTime || '09:00',
        returnTime: dto.returnTime || '18:00',
        durationDays,
        dailyRate: vehicle.dailyRate,
        discountAmount: pricing.discountAmount,
        subtotal: pricing.subtotal,
        depositAmount: vehicle.depositAmount,
        totalAmount: pricing.total,
        notes: dto.notes,
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        vehicle: { select: { id: true, brand: true, model: true, registration: true, mainImageUrl: true } },
      },
    });

    await this.notificationsService.create({
      userId,
      type: 'BOOKING_CREATED',
      title: 'Réservation créée',
      message: `Votre réservation ${bookingReference} a été créée. En attente de confirmation.`,
    });

    return booking;
  }

  async getMyBookings(userId: number, dto: FilterBookingsDto) {
    const { page, limit, status, paymentStatus } = dto;
    const skip = (page - 1) * limit;

    const where: any = { clientId: userId };
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          vehicle: { select: { brand: true, model: true, registration: true, mainImageUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMyBookingById(userId: number, id: number) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, clientId: userId },
      include: {
        client: { select: { firstName: true, lastName: true, email: true, phone: true, cin: true } },
        vehicle: { select: { brand: true, model: true, registration: true, category: true, mainImageUrl: true } },
        payments: true,
      },
    });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    return booking;
  }

  async cancelMyBooking(userId: number, id: number) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, clientId: userId },
      include: { vehicle: true, payments: true },
    });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new ForbiddenException('Cette réservation ne peut plus être annulée');
    }

    const agencyConfig = await this.prisma.agencyConfig.findFirst();
    const hoursUntilStart = differenceInDays(booking.startDate, new Date()) * 24;
    let refundPercent = 0;

    if (hoursUntilStart > (agencyConfig?.freeCancelHours || 48)) {
      refundPercent = 100;
    } else if (hoursUntilStart > 24) {
      refundPercent = Number(agencyConfig?.cancelFee24to48 || 70);
    } else if (hoursUntilStart > 0) {
      refundPercent = Number(agencyConfig?.cancelFeeLess24 || 50);
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return {
      message: 'Réservation annulée',
      refundPercent,
      refundableAmount: booking.payments[0] 
        ? Number(booking.payments[0].amount) * (refundPercent / 100) 
        : 0,
    };
  }

  async getAllBookings(dto: FilterBookingsDto) {
    const { page, limit, search, status, paymentStatus } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { bookingReference: { contains: search } },
        { client: { firstName: { contains: search, mode: 'insensitive' } } },
        { client: { lastName: { contains: search, mode: 'insensitive' } } },
        { vehicle: { brand: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBookingById(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, cin: true, drivingLicense: true } },
        vehicle: { select: { brand: true, model: true, registration: true, category: true, mainImageUrl: true } },
        payments: true,
      },
    });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    return booking;
  }

  async confirmBooking(id: number) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Seules les réservations en attente peuvent être confirmées');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        client: true,
        vehicle: true,
      },
    });

    await this.notificationsService.create({
      userId: updated.clientId,
      type: 'BOOKING_CONFIRMED',
      title: 'Réservation confirmée',
      message: `Votre réservation ${updated.bookingReference} est confirmée.`,
    });

    return updated;
  }

  async updateBookingStatus(id: number, status: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { vehicle: true } });
    if (!booking) throw new NotFoundException('Réservation non trouvée');

    if (status === 'ACTIVE') {
      await this.prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'RENTED' },
      });
    } else if (status === 'COMPLETED' || status === 'CANCELLED') {
      await this.prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async confirmByIdAndPay(bookingId: number, paymentData: any) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { vehicle: true } });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    if (booking.status !== 'PENDING') throw new ConflictException('Réservation déjà traitée');

    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        amount: booking.totalAmount,
        paymentMethod: paymentData.method,
        gatewayPaymentId: paymentData.gatewayId,
        gatewayResponse: paymentData.gatewayResponse,
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: paymentData.method,
      },
      include: {
        client: true,
        vehicle: true,
        payments: true,
      },
    });

    return updated;
  }

  private calculatePrice(dailyRate: any, durationDays: number, priceRules: any[], startDate: Date) {
    let subtotal = Number(dailyRate) * durationDays;
    let discountAmount = 0;
    let extraAmount = 0;

    const dayOfWeek = startDate.getDay();
    
    for (const rule of priceRules) {
      let applies = false;

      if (rule.type === 'LONG_TERM' && durationDays >= rule.minDays) {
        applies = true;
      } else if (rule.type === 'WEEKEND' && (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0)) {
        applies = true;
      } else if (rule.type === 'SEASONAL' && rule.startDate && rule.endDate) {
        const ruleStart = new Date(rule.startDate);
        const ruleEnd = new Date(rule.endDate);
        if (startDate >= ruleStart && startDate <= ruleEnd) {
          applies = true;
        }
      }

      if (applies) {
        if (rule.discountPct) {
          discountAmount = Math.max(discountAmount, Number(rule.discountPct) * subtotal / 100);
        }
        if (rule.extraPct) {
          extraAmount = Math.max(extraAmount, Number(rule.extraPct) * subtotal / 100);
        }
      }
    }

    const adjustedSubtotal = subtotal - discountAmount + extraAmount;
    const total = adjustedSubtotal;

    return {
      subtotal,
      discountAmount,
      extraAmount,
      total,
    };
  }
}