import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let mailService: MailService;

  const mockPrismaService = {
    maintenanceRecord: {
      findMany: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    vehicle: {
      update: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockMailService = {
    sendBookingReminder: jest.fn(),
  };

  const mockMaintenance = {
    id: 1,
    vehicleId: 1,
    type: 'OIL_CHANGE',
    title: 'Oil Change',
    nextDueDate: new Date(),
    vehicle: { brand: 'Toyota', model: 'Corolla', registration: 'AB-123-TU' },
  };

  const mockBooking = {
    id: 1,
    bookingReference: 'REF-2026-12345',
    clientId: 1,
    vehicleId: 1,
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    client: { firstName: 'John', email: 'john@example.com' },
    vehicle: { brand: 'Toyota', model: 'Corolla' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkMaintenanceAlerts', () => {
    it('should check and send maintenance alerts', async () => {
      mockPrismaService.maintenanceRecord.findMany.mockResolvedValue([mockMaintenance]);
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 1, role: 'ADMIN' });
      mockNotificationsService.create.mockResolvedValue(null as never);

      await service.checkMaintenanceAlerts();

      expect(mockPrismaService.maintenanceRecord.findMany).toHaveBeenCalledWith({
        where: {
          nextDueDate: {
            gte: expect.any(Date),
            lt: expect.any(Date),
          },
          doneDate: null,
        },
        include: {
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
      });
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });
  });

  describe('sendBookingReminders', () => {
    it('should send booking reminders for tomorrow', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);
      mockMailService.sendBookingReminder.mockResolvedValue(null as never);

      await service.sendBookingReminders();

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: {
          status: 'CONFIRMED',
          startDate: {
            gte: expect.any(Date),
            lt: expect.any(Date),
          },
        },
        include: {
          client: { select: { firstName: true, email: true } },
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
      });
      expect(mockMailService.sendBookingReminder).toHaveBeenCalled();
    });
  });

  describe('processExpiredBookings', () => {
    it('should process expired bookings', async () => {
      const expiredBooking = {
        ...mockBooking,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        status: 'CONFIRMED',
      };

      mockPrismaService.booking.findMany.mockResolvedValue([expiredBooking]);
      mockPrismaService.booking.update.mockResolvedValue(expiredBooking);
      mockPrismaService.vehicle.update.mockResolvedValue({});

      await service.processExpiredBookings();

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          endDate: { lt: expect.any(Date) },
        },
      });
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: expiredBooking.id },
        data: { status: 'COMPLETED' },
      });
      expect(mockPrismaService.vehicle.update).toHaveBeenCalledWith({
        where: { id: expiredBooking.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    });
  });

  describe('checkNoShowBookings', () => {
    it('should mark no-show bookings', async () => {
      const noShowBooking = {
        ...mockBooking,
        startDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'CONFIRMED',
        pickupTime: '09:00',
      };

      mockPrismaService.booking.findMany.mockResolvedValue([noShowBooking]);
      mockPrismaService.booking.update.mockResolvedValue(noShowBooking);
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 1, role: 'ADMIN' });
      mockNotificationsService.create.mockResolvedValue(null as never);

      await service.checkNoShowBookings();

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: {
          status: 'CONFIRMED',
          startDate: { lt: expect.any(Date) },
        },
      });
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: noShowBooking.id },
        data: { status: 'NO_SHOW' },
      });
    });
  });
});
