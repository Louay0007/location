import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    priceRule: {
      findMany: jest.fn(),
    },
    agencyConfig: {
      findFirst: jest.fn(),
    },
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockBooking = {
    id: 1,
    bookingReference: 'REF-2026-12345',
    clientId: 1,
    vehicleId: 1,
    startDate: new Date('2026-04-21'),
    endDate: new Date('2026-04-25'),
    status: 'PENDING',
    paymentStatus: 'PENDING',
    totalAmount: 400,
    dailyRate: 100,
    depositAmount: 200,
    client: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    vehicle: { brand: 'Toyota', model: 'Corolla', registration: 'AB-123-TU' },
    payments: [{ amount: 400, status: 'PAID' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const dto = {
        vehicleId: 1,
        startDate: '2026-04-21',
        endDate: '2026-04-25',
        pickupTime: '09:00',
        returnTime: '18:00',
      };

      mockPrismaService.vehicle.findUnique.mockResolvedValue({
        id: 1,
        status: 'AVAILABLE',
        dailyRate: 100,
        depositAmount: 200,
      });
      mockPrismaService.booking.findFirst.mockResolvedValue(null);
      mockPrismaService.priceRule.findMany.mockResolvedValue([]);
      mockPrismaService.booking.create.mockResolvedValue(mockBooking);
      mockNotificationsService.create.mockResolvedValue(null as never);

      const result = await service.createBooking(1, dto);

      expect(mockPrismaService.booking.findFirst).toHaveBeenCalledWith({
        where: {
          vehicleId: 1,
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          startDate: { lt: expect.any(Date) },
          endDate: { gt: expect.any(Date) },
        },
      });
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientId: 1,
          vehicleId: 1,
          bookingReference: expect.stringMatching(/^REF-\d{4}-\d{5}$/),
        }),
        include: {
          client: { select: { email: true, firstName: true, id: true, lastName: true, phone: true } },
          vehicle: { select: { brand: true, id: true, mainImageUrl: true, model: true, registration: true } },
        },
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      const dto = { vehicleId: 1, startDate: '2026-04-21', endDate: '2026-04-25' };
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.createBooking(1, dto)).rejects.toThrow(NotFoundException);
    });

  });

  describe('getMyBookings', () => {
    it('should return user bookings', async () => {
      const dto = { page: 1, limit: 20 };
      mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);
      mockPrismaService.booking.count.mockResolvedValue(1);

      const result = await service.getMyBookings(1, dto);

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: { clientId: 1 },
        include: expect.any(Object),
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({ data: [mockBooking], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } });
    });
  });

  describe('getMyBookingById', () => {
    it('should return user booking by id', async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue(mockBooking);

      const result = await service.getMyBookingById(1, 1);

      expect(mockPrismaService.booking.findFirst).toHaveBeenCalledWith({
        where: { id: 1, clientId: 1 },
        include: {
          client: { select: { firstName: true, lastName: true, email: true, phone: true, cin: true } },
          vehicle: { select: { brand: true, model: true, registration: true, category: true, mainImageUrl: true } },
          payments: true,
        },
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue(null);

      await expect(service.getMyBookingById(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelMyBooking', () => {
    it('should cancel user booking', async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue(mockBooking);
      mockPrismaService.booking.update.mockResolvedValue({ ...mockBooking, status: 'CANCELLED' });
      mockPrismaService.agencyConfig.findFirst.mockResolvedValue({
        freeCancelHours: 48,
        cancelFee24to48: 70,
        cancelFeeLess24: 50,
      });
      mockNotificationsService.create.mockResolvedValue(null as never);

      const result = await service.cancelMyBooking(1, 1);

      expect(mockPrismaService.booking.findFirst).toHaveBeenCalledWith({
        where: { id: 1, clientId: 1 },
        include: { vehicle: true, payments: true },
      });
      expect(result).toEqual({ message: 'Réservation annulée', refundPercent: 0, refundableAmount: 0 });
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue(null);

      await expect(service.cancelMyBooking(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings for admin', async () => {
      const dto = { page: 1, limit: 20 };
      mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);
      mockPrismaService.booking.count.mockResolvedValue(1);

      const result = await service.getAllBookings(dto);

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({ data: [mockBooking], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } });
    });
  });

  describe('getBookingById', () => {
    it('should return booking by id for admin', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.getBookingById(1);

      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.getBookingById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmBooking', () => {
    it('should confirm booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.booking.update.mockResolvedValue({ ...mockBooking, status: 'CONFIRMED' });
      mockPrismaService.vehicle.update.mockResolvedValue({});

      const result = await service.confirmBooking(1);

      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'CONFIRMED' },
        include: { client: true, vehicle: true },
      });
      expect(result).toEqual({ ...mockBooking, status: 'CONFIRMED' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.confirmBooking(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.booking.update.mockResolvedValue({ ...mockBooking, status: 'ACTIVE' });

      const result = await service.updateBookingStatus(1, 'ACTIVE');

      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'ACTIVE' },
      });
      expect(result).toEqual({ ...mockBooking, status: 'ACTIVE' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.updateBookingStatus(999, 'ACTIVE')).rejects.toThrow(NotFoundException);
    });
  });
});
