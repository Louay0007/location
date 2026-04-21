import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async getAllMaintenanceRecords(vehicleId?: number) {
    const where = vehicleId ? { vehicleId } : {};
    return this.prisma.maintenanceRecord.findMany({
      where,
      include: {
        vehicle: { select: { brand: true, model: true, registration: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMaintenanceAlerts() {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const records = await this.prisma.maintenanceRecord.findMany({
      where: {
        nextDueDate: {
          lte: thirtyDaysLater,
        },
      },
      include: {
        vehicle: { select: { brand: true, model: true, registration: true, status: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    return records.map(r => ({
      ...r,
      urgency: this.calculateUrgency(r.nextDueDate, today),
    }));
  }

  async getVehicleMaintenanceHistory(vehicleId: number) {
    return this.prisma.maintenanceRecord.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMaintenanceRecordById(id: number) {
    const record = await this.prisma.maintenanceRecord.findUnique({
      where: { id },
      include: {
        vehicle: { select: { brand: true, model: true, registration: true } },
      },
    });
    if (!record) throw new NotFoundException('Enregistrement non trouve');
    return record;
  }

  async createMaintenanceRecord(dto: CreateMaintenanceDto) {
    const record = await this.prisma.maintenanceRecord.create({
      data: {
        vehicleId: dto.vehicleId,
        type: dto.type as any,
        title: dto.title,
        description: dto.description,
        cost: dto.cost,
        mileageAt: dto.mileageAt,
        doneDate: dto.doneDate ? new Date(dto.doneDate) : undefined,
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : undefined,
        provider: dto.provider,
        documentUrl: dto.documentUrl,
      },
      include: { vehicle: true },
    });

    if (dto.type === 'ACCIDENT_REPAIR' || dto.type === 'OTHER') {
      await this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: 'MAINTENANCE' },
      });
    }

    return record;
  }

  async updateMaintenanceRecord(id: number, dto: Partial<CreateMaintenanceDto>) {
    const record = await this.prisma.maintenanceRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Enregistrement non trouve');

    const updateData: any = { ...dto };
    if (dto.doneDate) {
      updateData.doneDate = new Date(dto.doneDate);
    }
    if (dto.nextDueDate) {
      updateData.nextDueDate = new Date(dto.nextDueDate);
    }
    delete updateData.vehicleId;
    delete updateData.type;
    delete updateData.title;
    delete updateData.description;
    delete updateData.cost;
    delete updateData.mileageAt;
    delete updateData.provider;
    delete updateData.documentUrl;

    return this.prisma.maintenanceRecord.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteMaintenanceRecord(id: number) {
    const record = await this.prisma.maintenanceRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Enregistrement non trouve');

    await this.prisma.maintenanceRecord.delete({ where: { id } });
    return { message: 'Enregistrement supprime' };
  }

  async getUpcomingMaintenance(days: number = 7) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    return this.prisma.maintenanceRecord.findMany({
      where: {
        nextDueDate: {
          gte: today,
          lte: futureDate,
        },
        doneDate: null,
      },
      include: {
        vehicle: { select: { brand: true, model: true, registration: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  async getOverdueMaintenance() {
    const today = new Date();

    return this.prisma.maintenanceRecord.findMany({
      where: {
        nextDueDate: {
          lt: today,
        },
        doneDate: null,
      },
      include: {
        vehicle: { select: { brand: true, model: true, registration: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  private calculateUrgency(nextDueDate: Date | null, today: Date): string {
    if (!nextDueDate) return 'NORMAL';
    const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) return 'EXPIRED';
    if (daysUntilDue <= 1) return 'CRITICAL';
    if (daysUntilDue <= 7) return 'HIGH';
    return 'NORMAL';
  }
}