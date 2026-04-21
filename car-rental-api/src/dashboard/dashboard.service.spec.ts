import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    booking: {
      aggregate: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    vehicle: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    payment: {
      groupBy: jest.fn(),
    },
    maintenanceRecord: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getKPIs', () => {
    it('should return dashboard KPIs', async () => {
      mockPrismaService.booking.aggregate
        .mockResolvedValueOnce({ _sum: { totalAmount: 10000 } })
        .mockResolvedValueOnce({ _sum: { totalAmount: 8000 } });
      mockPrismaService.booking.count
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(5);
      mockPrismaService.vehicle.count
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(20);
      mockPrismaService.user.count.mockResolvedValue(50);

      const result = await service.getKPIs();

      expect(result).toEqual({
        revenue: {
          current: 10000,
          lastMonth: 8000,
          change: 25,
        },
        bookings: {
          current: 20,
          pending: 5,
        },
        vehicles: {
          available: 15,
          total: 20,
          occupancyRate: 25,
        },
        clients: {
          active: 50,
        },
      });
    });
  });

  describe('getRevenueByMonth', () => {
    it('should return revenue data for specified months', async () => {
      mockPrismaService.booking.aggregate.mockResolvedValue({ _sum: { totalAmount: 5000 } });

      const result = await service.getRevenueByMonth(12);

      expect(mockPrismaService.booking.aggregate).toHaveBeenCalledTimes(12);
      expect(result).toHaveLength(12);
      expect(result[0]).toHaveProperty('month');
      expect(result[0]).toHaveProperty('revenue');
    });
  });

  describe('getBookingsByStatus', () => {
    it('should return bookings count by status', async () => {
      mockPrismaService.booking.count.mockResolvedValue(10);

      const result = await service.getBookingsByStatus();

      expect(mockPrismaService.booking.count).toHaveBeenCalledTimes(6);
      expect(result).toHaveLength(6);
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('count');
    });
  });

  describe('getFleetOccupancy', () => {
    it('should return fleet occupancy data', async () => {
      mockPrismaService.booking.count.mockResolvedValue(10);
      mockPrismaService.vehicle.count.mockResolvedValue(20);

      const result = await service.getFleetOccupancy(30);

      expect(mockPrismaService.booking.count).toHaveBeenCalledTimes(30);
      expect(mockPrismaService.vehicle.count).toHaveBeenCalledTimes(30);
      expect(result).toHaveLength(30);
    });
  });

  describe('getTopVehicles', () => {
    it('should return top vehicles by revenue', async () => {
      const vehicles = [
        { id: 1, brand: 'Toyota', model: 'Corolla', registration: 'AB-123-TU', _count: { bookings: 10 }, bookings: [{ totalAmount: 100 }] },
      ];
      mockPrismaService.vehicle.findMany.mockResolvedValue(vehicles);

      const result = await service.getTopVehicles(5);

      expect(mockPrismaService.vehicle.findMany).toHaveBeenCalledWith({
        where: { isVisible: true },
        include: {
          _count: { select: { bookings: true } },
          bookings: {
            where: { paymentStatus: 'PAID' },
            select: { totalAmount: true },
          },
        },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getPaymentMethodsDistribution', () => {
    it('should return payment methods distribution', async () => {
      mockPrismaService.payment.groupBy.mockResolvedValue([
        { paymentMethod: 'PAYMEE', _count: 10, _sum: { amount: 1000 } },
        { paymentMethod: 'STRIPE', _count: 5, _sum: { amount: 500 } },
      ]);

      const result = await service.getPaymentMethodsDistribution();

      expect(mockPrismaService.payment.groupBy).toHaveBeenCalledWith({
        by: ['paymentMethod'],
        where: { status: 'PAID' },
        _count: true,
        _sum: { amount: true },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('method');
      expect(result[0]).toHaveProperty('count');
      expect(result[0]).toHaveProperty('amount');
    });
  });

  describe('getRecentBookings', () => {
    it('should return recent bookings', async () => {
      const bookings = [
        { id: 1, bookingReference: 'REF-123', client: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }, vehicle: { brand: 'Toyota', model: 'Corolla' } },
      ];
      mockPrismaService.booking.findMany.mockResolvedValue(bookings);

      const result = await service.getRecentBookings(10);

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        take: 10,
        include: {
          client: { select: { firstName: true, lastName: true, email: true } },
          vehicle: { select: { brand: true, model: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(bookings);
    });
  });

  describe('getMaintenanceStats', () => {
    it('should return maintenance statistics', async () => {
      mockPrismaService.maintenanceRecord.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2);
      mockPrismaService.maintenanceRecord.aggregate.mockResolvedValue({ _sum: { cost: 500 } });

      const result = await service.getMaintenanceStats();

      expect(mockPrismaService.maintenanceRecord.count).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.maintenanceRecord.aggregate).toHaveBeenCalledWith({
        where: { cost: { not: null } },
        _sum: { cost: true },
      });
      expect(result).toEqual({
        upcoming: 5,
        overdue: 2,
        totalCost: 500,
      });
    });
  });
});
