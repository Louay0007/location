import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    maintenanceRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    vehicle: {
      update: jest.fn(),
    },
  };

  const mockRecord = {
    id: 1,
    vehicleId: 1,
    type: 'OIL_CHANGE',
    title: 'Oil Change',
    description: 'Regular oil change',
    cost: 50,
    mileageAt: 15000,
    doneDate: new Date(),
    nextDueDate: new Date(),
    provider: 'AutoShop',
    documentUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    vehicle: { brand: 'Toyota', model: 'Corolla', registration: 'AB-123-TU' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllMaintenanceRecords', () => {
    it('should return all maintenance records', async () => {
      const records = [mockRecord];
      mockPrismaService.maintenanceRecord.findMany.mockResolvedValue(records);

      const result = await service.getAllMaintenanceRecords();

      expect(mockPrismaService.maintenanceRecord.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(records);
    });

    it('should filter by vehicleId', async () => {
      const records = [mockRecord];
      mockPrismaService.maintenanceRecord.findMany.mockResolvedValue(records);

      const result = await service.getAllMaintenanceRecords(1);

      expect(mockPrismaService.maintenanceRecord.findMany).toHaveBeenCalledWith({
        where: { vehicleId: 1 },
        include: {
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(records);
    });
  });

  describe('getMaintenanceAlerts', () => {
    it('should return maintenance alerts', async () => {
      const records = [mockRecord];
      mockPrismaService.maintenanceRecord.findMany.mockResolvedValue(records);

      const result = await service.getMaintenanceAlerts();

      expect(mockPrismaService.maintenanceRecord.findMany).toHaveBeenCalledWith({
        where: {
          nextDueDate: {
            lte: expect.any(Date),
          },
        },
        include: {
          vehicle: { select: { brand: true, model: true, registration: true, status: true } },
        },
        orderBy: { nextDueDate: 'asc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getVehicleMaintenanceHistory', () => {
    it('should return vehicle maintenance history', async () => {
      const records = [mockRecord];
      mockPrismaService.maintenanceRecord.findMany.mockResolvedValue(records);

      const result = await service.getVehicleMaintenanceHistory(1);

      expect(mockPrismaService.maintenanceRecord.findMany).toHaveBeenCalledWith({
        where: { vehicleId: 1 },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(records);
    });
  });

  describe('getMaintenanceRecordById', () => {
    it('should return maintenance record by id', async () => {
      mockPrismaService.maintenanceRecord.findUnique.mockResolvedValue(mockRecord);

      const result = await service.getMaintenanceRecordById(1);

      expect(mockPrismaService.maintenanceRecord.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
      });
      expect(result).toEqual(mockRecord);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.maintenanceRecord.findUnique.mockResolvedValue(null);

      await expect(service.getMaintenanceRecordById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMaintenanceRecord', () => {
    it('should create maintenance record', async () => {
      const dto: CreateMaintenanceDto = {
        vehicleId: 1,
        type: 'OIL_CHANGE',
        title: 'Oil Change',
        description: 'Regular oil change',
        cost: 50,
        mileageAt: 15000,
        doneDate: '2026-04-21',
        nextDueDate: '2026-07-21',
        provider: 'AutoShop',
        documentUrl: null,
      };

      mockPrismaService.maintenanceRecord.create.mockResolvedValue(mockRecord);

      const result = await service.createMaintenanceRecord(dto);

      expect(mockPrismaService.maintenanceRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          vehicleId: dto.vehicleId,
          type: dto.type,
          title: dto.title,
          doneDate: expect.any(Date),
          nextDueDate: expect.any(Date),
        }),
        include: { vehicle: true },
      });
      expect(result).toEqual(mockRecord);
    });

    it('should update vehicle status for accident repair', async () => {
      const dto: CreateMaintenanceDto = {
        vehicleId: 1,
        type: 'ACCIDENT_REPAIR',
        title: 'Accident Repair',
      };

      mockPrismaService.maintenanceRecord.create.mockResolvedValue(mockRecord);
      mockPrismaService.vehicle.update.mockResolvedValue({});

      await service.createMaintenanceRecord(dto);

      expect(mockPrismaService.vehicle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'MAINTENANCE' },
      });
    });
  });

  describe('updateMaintenanceRecord', () => {
    it('should update maintenance record', async () => {
      const updateData = { cost: 60 };
      const updatedRecord = { ...mockRecord, ...updateData };

      mockPrismaService.maintenanceRecord.findUnique.mockResolvedValue(mockRecord);
      mockPrismaService.maintenanceRecord.update.mockResolvedValue(updatedRecord);

      const result = await service.updateMaintenanceRecord(1, updateData);

      expect(mockPrismaService.maintenanceRecord.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.maintenanceRecord.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.any(Object),
      });
      expect(result).toEqual(updatedRecord);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.maintenanceRecord.findUnique.mockResolvedValue(null);

      await expect(service.updateMaintenanceRecord(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMaintenanceRecord', () => {
    it('should delete maintenance record', async () => {
      mockPrismaService.maintenanceRecord.findUnique.mockResolvedValue(mockRecord);
      mockPrismaService.maintenanceRecord.delete.mockResolvedValue(mockRecord);

      const result = await service.deleteMaintenanceRecord(1);

      expect(mockPrismaService.maintenanceRecord.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.maintenanceRecord.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ message: 'Enregistrement supprime' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.maintenanceRecord.findUnique.mockResolvedValue(null);

      await expect(service.deleteMaintenanceRecord(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUpcomingMaintenance', () => {
    it('should return upcoming maintenance', async () => {
      const records = [mockRecord];
      mockPrismaService.maintenanceRecord.findMany.mockResolvedValue(records);

      const result = await service.getUpcomingMaintenance(7);

      expect(mockPrismaService.maintenanceRecord.findMany).toHaveBeenCalledWith({
        where: {
          nextDueDate: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
          doneDate: null,
        },
        include: {
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
        orderBy: { nextDueDate: 'asc' },
      });
      expect(result).toEqual(records);
    });
  });

  describe('getOverdueMaintenance', () => {
    it('should return overdue maintenance', async () => {
      const records = [mockRecord];
      mockPrismaService.maintenanceRecord.findMany.mockResolvedValue(records);

      const result = await service.getOverdueMaintenance();

      expect(mockPrismaService.maintenanceRecord.findMany).toHaveBeenCalledWith({
        where: {
          nextDueDate: {
            lt: expect.any(Date),
          },
          doneDate: null,
        },
        include: {
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
        orderBy: { nextDueDate: 'asc' },
      });
      expect(result).toEqual(records);
    });
  });
});
