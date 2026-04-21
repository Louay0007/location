import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;
  let configService: ConfigService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcome', () => {
    it('should send welcome email', async () => {
      mockConfigService.get.mockReturnValue('http://localhost:4200');
      mockMailerService.sendMail.mockResolvedValue({});

      await service.sendWelcome('test@example.com', 'John', 'verify-token-123');

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Bienvenue sur Car Rental',
        template: './welcome',
        context: {
          firstName: 'John',
          verifyUrl: 'http://localhost:4200/auth/verify-email?token=verify-token-123',
        },
      });
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', async () => {
      mockConfigService.get.mockReturnValue('http://localhost:4200');
      mockMailerService.sendMail.mockResolvedValue({});

      await service.sendPasswordReset('test@example.com', 'John', 'reset-token-123');

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Réinitialisation de votre mot de passe',
        template: './password-reset',
        context: {
          firstName: 'John',
          resetUrl: 'http://localhost:4200/auth/reset-password?token=reset-token-123',
        },
      });
    });
  });

  describe('sendBookingConfirmation', () => {
    it('should send booking confirmation email', async () => {
      const booking = {
        client: { firstName: 'John', email: 'test@example.com' },
        bookingReference: 'REF-2026-12345',
        vehicle: { brand: 'Toyota', model: 'Corolla' },
        startDate: new Date('2026-04-21'),
        endDate: new Date('2026-04-25'),
        totalAmount: 500,
      };

      mockMailerService.sendMail.mockResolvedValue({});

      await service.sendBookingConfirmation(booking);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
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
    });
  });

  describe('sendPaymentConfirmation', () => {
    it('should send payment confirmation email', async () => {
      const booking = {
        client: { firstName: 'John', email: 'test@example.com' },
        bookingReference: 'REF-2026-12345',
        totalAmount: 500,
      };

      mockMailerService.sendMail.mockResolvedValue({});

      await service.sendPaymentConfirmation(booking);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: booking.client.email,
        subject: `Paiement confirmé - ${booking.bookingReference}`,
        template: './payment-success',
        context: {
          firstName: booking.client.firstName,
          bookingReference: booking.bookingReference,
          amount: booking.totalAmount,
        },
      });
    });
  });

  describe('sendCancellationNotice', () => {
    it('should send cancellation notice email', async () => {
      const booking = {
        client: { firstName: 'John', email: 'test@example.com' },
        bookingReference: 'REF-2026-12345',
        vehicle: { brand: 'Toyota', model: 'Corolla' },
      };

      mockMailerService.sendMail.mockResolvedValue({});

      await service.sendCancellationNotice(booking);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: booking.client.email,
        subject: `Réservation ${booking.bookingReference} annulée`,
        template: './cancellation',
        context: {
          firstName: booking.client.firstName,
          bookingReference: booking.bookingReference,
          vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
        },
      });
    });
  });

  describe('sendBookingReminder', () => {
    it('should send booking reminder email', async () => {
      const booking = {
        client: { firstName: 'John', email: 'test@example.com' },
        bookingReference: 'REF-2026-12345',
        vehicle: { brand: 'Toyota', model: 'Corolla' },
        startDate: new Date('2026-04-22'),
        pickupTime: '09:00',
      };

      mockMailerService.sendMail.mockResolvedValue({});

      await service.sendBookingReminder(booking);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
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
    });
  });
});
