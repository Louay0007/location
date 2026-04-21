import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigService,
  ) {}

  async sendWelcome(email: string, firstName: string, verifyToken: string) {
    const verifyUrl = `${this.config.get('APP_URL')}/auth/verify-email?token=${verifyToken}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenue sur Car Rental',
      template: './welcome',
      context: {
        firstName,
        verifyUrl,
      },
    });
  }

  async sendPasswordReset(email: string, firstName: string, resetToken: string) {
    const resetUrl = `${this.config.get('APP_URL')}/auth/reset-password?token=${resetToken}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      template: './password-reset',
      context: {
        firstName,
        resetUrl,
      },
    });
  }

  async sendBookingConfirmation(booking: any) {
    await this.mailerService.sendMail({
      to: booking.client.email,
      subject: `Réservation ${booking.bookingReference} confirmée`,
      template: './booking-confirmed',
      context: {
        firstName: booking.client.firstName,
        bookingReference: booking.bookingReference,
        vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
      },
    });
  }

  async sendPaymentConfirmation(booking: any) {
    await this.mailerService.sendMail({
      to: booking.client.email,
      subject: `Paiement confirmé - ${booking.bookingReference}`,
      template: './payment-success',
      context: {
        firstName: booking.client.firstName,
        bookingReference: booking.bookingReference,
        amount: booking.totalAmount,
      },
    });
  }

  async sendCancellationNotice(booking: any) {
    await this.mailerService.sendMail({
      to: booking.client.email,
      subject: `Réservation ${booking.bookingReference} annulée`,
      template: './cancellation',
      context: {
        firstName: booking.client.firstName,
        bookingReference: booking.bookingReference,
        vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
      },
    });
  }

  async sendBookingReminder(booking: any) {
    await this.mailerService.sendMail({
      to: booking.client.email,
      subject: `Rappel - Prise en charge demain ${booking.bookingReference}`,
      template: './reminder',
      context: {
        firstName: booking.client.firstName,
        bookingReference: booking.bookingReference,
        vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
        startDate: booking.startDate,
        pickupTime: booking.pickupTime,
      },
    });
  }
}