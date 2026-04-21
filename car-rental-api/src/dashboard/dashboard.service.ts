import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKPIs() {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const currentMonthRevenue = await this.prisma.booking.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalAmount: true },
    });

    const lastMonthRevenue = await this.prisma.booking.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { totalAmount: true },
    });

    const currentMonthBookings = await this.prisma.booking.count({
      where: { createdAt: { gte: monthStart, lte: monthEnd } },
    });

    const pendingBookings = await this.prisma.booking.count({
      where: { status: 'PENDING' },
    });

    const availableVehicles = await this.prisma.vehicle.count({
      where: { status: 'AVAILABLE', isVisible: true },
    });

    const totalVehicles = await this.prisma.vehicle.count({
      where: { isVisible: true },
    });

    const activeClients = await this.prisma.user.count({
      where: { isActive: true, role: 'CLIENT' },
    });

    const currentRevenue = Number(currentMonthRevenue._sum.totalAmount) || 0;
    const lastRevenue = Number(lastMonthRevenue._sum.totalAmount) || 0;
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    return {
      revenue: {
        current: currentRevenue,
        lastMonth: lastRevenue,
        change: revenueChange,
      },
      bookings: {
        current: currentMonthBookings,
        pending: pendingBookings,
      },
      vehicles: {
        available: availableVehicles,
        total: totalVehicles,
        occupancyRate: totalVehicles > 0 ? ((totalVehicles - availableVehicles) / totalVehicles) * 100 : 0,
      },
      clients: {
        active: activeClients,
      },
    };
  }

  async getRevenueByMonth(months: number = 12) {
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const revenue = await this.prisma.booking.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { totalAmount: true },
      });

      data.push({
        month: format(date, 'MMM yyyy'),
        monthKey: format(date, 'yyyy-MM'),
        revenue: Number(revenue._sum.totalAmount) || 0,
      });
    }
    return data;
  }

  async getBookingsByStatus() {
    const statuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    const data = [];

    for (const status of statuses) {
      const count = await this.prisma.booking.count({ where: { status: status as any } });
      data.push({ status, count });
    }

    return data;
  }

  async getFleetOccupancy(days: number = 30) {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const rentedVehicles = await this.prisma.booking.count({
        where: {
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          startDate: { lte: dayEnd },
          endDate: { gte: dayStart },
        },
      });

      const totalVehicles = await this.prisma.vehicle.count({
        where: { isVisible: true },
      });
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        rented: rentedVehicles,
        total: totalVehicles,
        occupancyRate: totalVehicles > 0 ? (rentedVehicles / totalVehicles) * 100 : 0,
      });
    }

    return data;
  }

  async getTopVehicles(limit: number = 5) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { isVisible: true },
      include: {
        _count: { select: { bookings: true } },
        bookings: {
          where: { paymentStatus: 'PAID' },
          select: { totalAmount: true },
        },
      },
    });

    const withRevenue = vehicles.map(v => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      registration: v.registration,
      bookingsCount: v._count.bookings,
      revenue: v.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0),
    }));

    return withRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getPaymentMethodsDistribution() {
    const payments = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: { status: 'PAID' },
      _count: true,
      _sum: { amount: true },
    });

    return payments.map(p => ({
      method: p.paymentMethod,
      count: p._count,
      amount: Number(p._sum.amount) || 0,
    }));
  }

  async getRecentBookings(limit: number = 10) {
    return this.prisma.booking.findMany({
      take: limit,
      include: {
        client: { select: { firstName: true, lastName: true, email: true } },
        vehicle: { select: { brand: true, model: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMaintenanceStats() {
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming = await this.prisma.maintenanceRecord.count({
      where: {
        nextDueDate: {
          gte: today,
          lte: sevenDaysLater,
        },
        doneDate: null,
      },
    });

    const overdue = await this.prisma.maintenanceRecord.count({
      where: {
        nextDueDate: {
          lt: today,
        },
        doneDate: null,
      },
    });

    const totalCost = await this.prisma.maintenanceRecord.aggregate({
      where: { cost: { not: null } },
      _sum: { cost: true },
    });

    return {
      upcoming,
      overdue,
      totalCost: Number(totalCost._sum.cost) || 0,
    };
  }
}