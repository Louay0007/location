import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkMaintenanceAlerts() {
    this.logger.log('Verification des alertes de maintenance...');

    const today = new Date();
    const alertThresholds = [30, 7, 1, 0];

    for (const days of alertThresholds) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const dateStr = targetDate.toISOString().split('T')[0];

      const records = await this.prisma.maintenanceRecord.findMany({
        where: {
          nextDueDate: {
            gte: new Date(`${dateStr}T00:00:00`),
            lt: new Date(`${dateStr}T23:59:59`),
          },
          doneDate: null,
        },
        include: {
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
      });

      for (const record of records) {
        const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!admin) continue;

        const label = days === 0 ? 'EXPIREE AUJOURD\'HUI' : `dans ${days} jour(s)`;
        const urgency = days === 0 ? 'EXPIRED' : days <= 7 ? 'HIGH' : 'NORMAL';

        await this.notifications.create({
          userId: admin.id,
          type: 'MAINTENANCE_ALERT',
          title: `Maintenance ${label}`,
          message: `${record.type} — ${record.vehicle.brand} ${record.vehicle.model} (${record.vehicle.registration}) : ${record.title}`,
        });

        this.logger.log(`Alerte maintenance: ${record.vehicle.registration} ${label}`);
      }
    }

    this.logger.log('Verification alertes terminee');
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendBookingReminders() {
    this.logger.log('Envoi rappels reservations J-1...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startDate: {
          gte: new Date(`${tomorrowStr}T00:00:00`),
          lt: new Date(`${tomorrowStr}T23:59:59`),
        },
      },
      include: {
        client: { select: { firstName: true, email: true } },
        vehicle: { select: { brand: true, model: true, registration: true } },
      },
    });

    for (const booking of bookings) {
      try {
        await this.mailService.sendBookingReminder(booking);
        this.logger.log(`Rappel envoye a ${booking.client.email} pour ${booking.bookingReference}`);
      } catch (error) {
        this.logger.error(`Erreur envoi rappel ${booking.bookingReference}: ${error.message}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processExpiredBookings() {
    this.logger.log('Traitement reservations expirees...');

    const now = new Date();

    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        endDate: { lt: now },
      },
    });

    for (const booking of expiredBookings) {
      if (booking.status === 'CONFIRMED') {
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'COMPLETED' },
        });

        await this.prisma.vehicle.update({
          where: { id: booking.vehicleId },
          data: { status: 'AVAILABLE' },
        });

        this.logger.log(`Reservation ${booking.bookingReference} marquee comme terminee`);
      }
    }

    this.logger.log(`Traitement termine: ${expiredBookings.length} reservations traitees`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkNoShowBookings() {
    this.logger.log('Verification no-shows...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const noShowBookings = await this.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startDate: { lt: today },
      },
    });

    for (const booking of noShowBookings) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'NO_SHOW' },
      });

      const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (admin) {
        await this.notifications.create({
          userId: admin.id,
          type: 'NO_SHOW',
          title: 'No-Show detecte',
          message: `Reservation ${booking.bookingReference}: client absent`,
        });
      }

      this.logger.log(`No-show detected: ${booking.bookingReference}`);
    }
  }
}