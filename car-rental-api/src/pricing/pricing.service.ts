import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async getAllPriceRules() {
    return this.prisma.priceRule.findMany({
      include: { vehicle: { select: { brand: true, model: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActivePriceRules() {
    return this.prisma.priceRule.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPriceRuleById(id: number) {
    const rule = await this.prisma.priceRule.findUnique({
      where: { id },
      include: { vehicle: { select: { brand: true, model: true } } },
    });
    if (!rule) throw new NotFoundException('Regle non trouvee');
    return rule;
  }

  async createPriceRule(dto: CreatePriceRuleDto) {
    return this.prisma.priceRule.create({
      data: {
        name: dto.name,
        type: dto.type as any,
        discountPct: dto.discountPct || 0,
        extraPct: dto.extraPct || 0,
        minDays: dto.minDays || 1,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        category: dto.category,
        vehicleId: dto.vehicleId,
        isActive: true,
      },
    });
  }

  async updatePriceRule(id: number, dto: Partial<CreatePriceRuleDto>) {
    const rule = await this.prisma.priceRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regle non trouvee');

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.type) updateData.type = dto.type;
    if (dto.discountPct !== undefined) updateData.discountPct = dto.discountPct;
    if (dto.extraPct !== undefined) updateData.extraPct = dto.extraPct;
    if (dto.minDays !== undefined) updateData.minDays = dto.minDays;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.vehicleId !== undefined) updateData.vehicleId = dto.vehicleId;

    return this.prisma.priceRule.update({
      where: { id },
      data: updateData,
    });
  }

  async togglePriceRule(id: number) {
    const rule = await this.prisma.priceRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regle non trouvee');

    return this.prisma.priceRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });
  }

  async deletePriceRule(id: number) {
    const rule = await this.prisma.priceRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regle non trouvee');

    await this.prisma.priceRule.delete({ where: { id } });
    return { message: 'Regle supprimee' };
  }
}