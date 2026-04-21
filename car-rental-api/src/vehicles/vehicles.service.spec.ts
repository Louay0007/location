import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    vehicle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    vehicleImage: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
    },
    priceRule: {
      findMany: jest.fn(),
    },
  };

  const mockVehicle = {
    id: 1,
    registration: 'AB-123-TU',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    category: 'SEDAN',
    fuelType: 'ESSENCE',
    transmission: 'AUTOMATIC',
    seats: 5,
    doors: 4,
    color: 'Blanc',
    mileage: 15000,
    status: 'AVAILABLE',
    dailyRate: 100,
    depositAmount: 200,
    description: 'Test vehicle',
    features: ['Climatisation', 'Bluetooth'],
    mainImageUrl: 'https://example.com/image.jpg',
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [],
    _count: { bookings: 0, reviews: 0 },
    priceRules: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllVehicles', () => {
    it('should return paginated vehicles', async () => {
      const dto = { page: 1, limit: 20, search: 'Toyota', category: 'SEDAN' };
      const vehicles = [mockVehicle];
      const total = 1;

      mockPrismaService.vehicle.findMany.mockResolvedValue(vehicles);
      mockPrismaService.vehicle.count.mockResolvedValue(total);

      const result = await service.getAllVehicles(dto);

      expect(mockPrismaService.vehicle.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          isVisible: true,
          category: 'SEDAN',
          OR: expect.arrayContaining([
            { brand: { contains: 'Toyota', mode: 'insensitive' } },
          ]),
        }),
        skip: 0,
        take: 20,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: vehicles,
        meta: { page: 1, limit: 20, total, totalPages: 1 },
      });
    });
  });

  describe('getVehicleById', () => {
    it('should return vehicle by id', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);

      const result = await service.getVehicleById(1);

      expect(mockPrismaService.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { bookings: true, reviews: true } },
          priceRules: { where: { isActive: true } },
        },
      });
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.getVehicleById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createVehicle', () => {
    it('should create a new vehicle', async () => {
      const dto: CreateVehicleDto = {
        registration: 'AB-456-TU',
        brand: 'Peugeot',
        model: '308',
        year: 2024,
        color: 'Noir',
        category: 'SUV',
        transmission: 'AUTOMATIC',
        fuelType: 'DIESEL',
        seats: 5,
        doors: 5,
        dailyRate: 120,
        depositAmount: 250,
        mileage: 0,
        status: 'AVAILABLE',
      };

      const createdVehicle = { ...mockVehicle, ...dto };
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);
      mockPrismaService.vehicle.create.mockResolvedValue(createdVehicle);

      const result = await service.createVehicle(dto);

      expect(mockPrismaService.vehicle.findUnique).toHaveBeenCalledWith({
        where: { registration: dto.registration },
      });
      expect(mockPrismaService.vehicle.create).toHaveBeenCalledWith({
        data: dto as any,
        include: { images: true },
      });
      expect(result).toEqual(createdVehicle);
    });

    it('should throw ConflictException if registration exists', async () => {
      const dto: CreateVehicleDto = {
        registration: 'AB-123-TU',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanc',
        category: 'SEDAN',
        transmission: 'AUTOMATIC',
        fuelType: 'ESSENCE',
        seats: 5,
        doors: 4,
        dailyRate: 100,
        depositAmount: 200,
        mileage: 15000,
        status: 'AVAILABLE',
      };

      mockPrismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);

      await expect(service.createVehicle(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateVehicle', () => {
    it('should update a vehicle', async () => {
      const updateData = { color: 'Rouge', mileage: 20000 };
      const updatedVehicle = { ...mockVehicle, ...updateData };

      mockPrismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrismaService.vehicle.update.mockResolvedValue(updatedVehicle);

      const result = await service.updateVehicle(1, updateData);

      expect(mockPrismaService.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockPrismaService.vehicle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData as any,
        include: { images: true },
      });
      expect(result).toEqual(updatedVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.updateVehicle(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteVehicle', () => {
    it('should delete a vehicle', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrismaService.vehicle.delete.mockResolvedValue(mockVehicle);

      const result = await service.deleteVehicle(1);

      expect(mockPrismaService.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockPrismaService.vehicle.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: 'Véhicule supprimé' });
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.deleteVehicle(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateVehicleStatus', () => {
    it('should update vehicle status', async () => {
      const updatedVehicle = { ...mockVehicle, status: 'MAINTENANCE' };
      mockPrismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrismaService.vehicle.update.mockResolvedValue(updatedVehicle);

      const result = await service.updateVehicleStatus(1, 'MAINTENANCE');

      expect(mockPrismaService.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockPrismaService.vehicle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'MAINTENANCE' as any },
      });
      expect(result).toEqual(updatedVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.updateVehicleStatus(999, 'MAINTENANCE')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getVehicleAvailability', () => {
    it('should return blocked dates for a vehicle', async () => {
      const year = 2026;
      const month = 4;
      const bookings = [
        { startDate: new Date('2026-04-10'), endDate: new Date('2026-04-15') },
      ];

      mockPrismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrismaService.booking.findMany.mockResolvedValue(bookings);

      const result = await service.getVehicleAvailability(1, year, month);

      expect(mockPrismaService.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: {
          vehicleId: 1,
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          startDate: { lte: expect.any(Date) },
          endDate: { gte: expect.any(Date) },
        },
        select: { startDate: true, endDate: true },
      });
      expect(result).toEqual({
        vehicleId: 1,
        year,
        month,
        blockedDates: expect.any(Array),
      });
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.getVehicleAvailability(999, 2026, 4)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCategories', () => {
    it('should return vehicle categories', async () => {
      const result = await service.getCategories();

      expect(result).toEqual(['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'LUXURY', 'VAN']);
    });
  });

  describe('addVehicleImage', () => {
    it('should add an image to a vehicle', async () => {
      const imageUrl = 'https://example.com/new-image.jpg';
      const image = { id: 1, vehicleId: 1, imageUrl, sortOrder: 0 };

      mockPrismaService.vehicleImage.findFirst.mockResolvedValue(null);
      mockPrismaService.vehicleImage.create.mockResolvedValue(image);

      const result = await service.addVehicleImage(1, imageUrl);

      expect(mockPrismaService.vehicleImage.findFirst).toHaveBeenCalledWith({
        where: { vehicleId: 1 },
        orderBy: { sortOrder: 'desc' },
      });
      expect(mockPrismaService.vehicleImage.create).toHaveBeenCalledWith({
        data: { vehicleId: 1, imageUrl, sortOrder: 0 },
      });
      expect(result).toEqual(image);
    });
  });

  describe('removeVehicleImage', () => {
    it('should remove an image from a vehicle', async () => {
      const image = { id: 1, vehicleId: 1, imageUrl: 'test.jpg', sortOrder: 0 };

      mockPrismaService.vehicleImage.delete.mockResolvedValue(image);

      const result = await service.removeVehicleImage(1, 1);

      expect(mockPrismaService.vehicleImage.delete).toHaveBeenCalledWith({
        where: { id: 1, vehicleId: 1 },
      });
      expect(result).toEqual(image);
    });
  });
});
