import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';

describe('PricingService', () => {
  let service: PricingService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    priceRule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockPriceRules = [
    {
      id: 1,
      name: 'Weekend Discount',
      type: 'WEEKEND',
      discountPct: 10,
      extraPct: 0,
      minDays: 1,
      isActive: true,
      category: 'SUV',
      vehicleId: null,
      startDate: null,
      endDate: null,
      createdAt: new Date(),
      vehicle: null,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPriceRules', () => {
    it('should return all price rules with vehicle info', async () => {
      mockPrismaService.priceRule.findMany.mockResolvedValue(mockPriceRules);

      const result = await service.getAllPriceRules();

      expect(mockPrismaService.priceRule.findMany).toHaveBeenCalledWith({
        include: { vehicle: { select: { brand: true, model: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPriceRules);
    });
  });

  describe('getActivePriceRules', () => {
    it('should return only active price rules', async () => {
      mockPrismaService.priceRule.findMany.mockResolvedValue(mockPriceRules);

      const result = await service.getActivePriceRules();

      expect(mockPrismaService.priceRule.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPriceRules);
    });
  });

  describe('getPriceRuleById', () => {
    it('should return a price rule by id', async () => {
      const rule = mockPriceRules[0];
      mockPrismaService.priceRule.findUnique.mockResolvedValue(rule);

      const result = await service.getPriceRuleById(1);

      expect(mockPrismaService.priceRule.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { vehicle: { select: { brand: true, model: true } } },
      });
      expect(result).toEqual(rule);
    });

    it('should throw NotFoundException if rule not found', async () => {
      mockPrismaService.priceRule.findUnique.mockResolvedValue(null);

      await expect(service.getPriceRuleById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPriceRule', () => {
    it('should create a new price rule', async () => {
      const dto: CreatePriceRuleDto = {
        name: 'Summer Promo',
        type: 'SEASONAL',
        discountPct: 15,
        extraPct: 0,
        minDays: 3,
        startDate: '2026-06-01',
        endDate: '2026-08-31',
        category: 'SEDAN',
        vehicleId: null,
      };

      const createdRule = { id: 2, ...dto, isActive: true, createdAt: new Date() };
      mockPrismaService.priceRule.create.mockResolvedValue(createdRule);

      const result = await service.createPriceRule(dto);

      expect(mockPrismaService.priceRule.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          type: dto.type,
          discountPct: dto.discountPct,
          extraPct: dto.extraPct,
          minDays: dto.minDays,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          category: dto.category,
          vehicleId: dto.vehicleId,
          isActive: true,
        }),
      });
      expect(result).toEqual(createdRule);
    });
  });

  describe('updatePriceRule', () => {
    it('should update a price rule', async () => {
      const existingRule = mockPriceRules[0];
      const updateDto: Partial<CreatePriceRuleDto> = {
        name: 'Updated Weekend Discount',
        discountPct: 15,
      };

      const updatedRule = { ...existingRule, ...updateDto };
      mockPrismaService.priceRule.findUnique.mockResolvedValue(existingRule);
      mockPrismaService.priceRule.update.mockResolvedValue(updatedRule);

      const result = await service.updatePriceRule(1, updateDto);

      expect(mockPrismaService.priceRule.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.priceRule.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          name: updateDto.name,
          discountPct: updateDto.discountPct,
        }),
      });
      expect(result).toEqual(updatedRule);
    });

    it('should throw NotFoundException if rule not found', async () => {
      mockPrismaService.priceRule.findUnique.mockResolvedValue(null);

      await expect(service.updatePriceRule(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('togglePriceRule', () => {
    it('should toggle price rule active status', async () => {
      const rule = mockPriceRules[0];
      const toggledRule = { ...rule, isActive: false };

      mockPrismaService.priceRule.findUnique.mockResolvedValue(rule);
      mockPrismaService.priceRule.update.mockResolvedValue(toggledRule);

      const result = await service.togglePriceRule(1);

      expect(mockPrismaService.priceRule.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.priceRule.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual(toggledRule);
    });

    it('should throw NotFoundException if rule not found', async () => {
      mockPrismaService.priceRule.findUnique.mockResolvedValue(null);

      await expect(service.togglePriceRule(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePriceRule', () => {
    it('should delete a price rule', async () => {
      const rule = mockPriceRules[0];
      mockPrismaService.priceRule.findUnique.mockResolvedValue(rule);
      mockPrismaService.priceRule.delete.mockResolvedValue(rule);

      const result = await service.deletePriceRule(1);

      expect(mockPrismaService.priceRule.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.priceRule.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ message: 'Regle supprimee' });
    });

    it('should throw NotFoundException if rule not found', async () => {
      mockPrismaService.priceRule.findUnique.mockResolvedValue(null);

      await expect(service.deletePriceRule(999)).rejects.toThrow(NotFoundException);
    });
  });
});
