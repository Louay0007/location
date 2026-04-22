import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async getAllVehicles(dto: any) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { isVisible: true };
    if (dto.search) {
      where.OR = [
        { brand: { contains: dto.search, mode: 'insensitive' } },
        { model: { contains: dto.search, mode: 'insensitive' } },
        { registration: { contains: dto.search } },
      ];
    }
    if (dto.category) where.category = dto.category;
    if (dto.fuelType) where.fuelType = dto.fuelType;
    if (dto.transmission) where.transmission = dto.transmission;
    if (dto.status) where.status = dto.status;

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getVehicleById(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { bookings: true, reviews: true } },
        priceRules: { where: { isActive: true } },
      },
    });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');
    return vehicle;
  }

  async createVehicle(dto: CreateVehicleDto) {
    const exists = await this.prisma.vehicle.findUnique({
      where: { registration: dto.registration },
    });
    if (exists) throw new ConflictException('Ce numéro d\'immatriculation existe déjà');

    return this.prisma.vehicle.create({
      data: dto as any,
      include: { images: true },
    });
  }

  async updateVehicle(id: number, dto: any) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    return this.prisma.vehicle.update({
      where: { id },
      data: dto as any,
      include: { images: true },
    });
  }

  async deleteVehicle(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    await this.prisma.vehicle.delete({ where: { id } });
    return { message: 'Véhicule supprimé' };
  }

  async updateVehicleStatus(id: number, status: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    return this.prisma.vehicle.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async getVehicleAvailability(vehicleId: number, year: number, month: number) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const bookings = await this.prisma.booking.findMany({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: { startDate: true, endDate: true },
    });

    const blockedDates = bookings.flatMap(b => {
      const dates: string[] = [];
      const current = new Date(b.startDate);
      const end = new Date(b.endDate);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    });

    return {
      vehicleId,
      year,
      month,
      blockedDates,
    };
  }

  async getCategories() {
    return ['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'LUXURY', 'VAN'];
  }

  async getCategoryCounts() {
    const counts = await this.prisma.vehicle.groupBy({
      by: ['category'],
      where: { isVisible: true },
      _count: { category: true },
    });
    return counts.map(c => ({ category: c.category, count: c._count.category }));
  }

  async getFleetStats() {
    const [vehicleCount, bookingCount, clientCount] = await Promise.all([
      this.prisma.vehicle.count({ where: { isVisible: true } }),
      this.prisma.booking.count(),
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
    ]);
    return { vehicleCount, bookingCount, clientCount };
  }

  async addVehicleImage(vehicleId: number, imageUrl: string, altText?: string) {
    const lastImage = await this.prisma.vehicleImage.findFirst({
      where: { vehicleId },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

    return this.prisma.vehicleImage.create({
      data: { vehicleId, imageUrl, altText, sortOrder },
    });
  }

  async removeVehicleImage(vehicleId: number, imageId: number) {
    return this.prisma.vehicleImage.delete({
      where: { id: imageId, vehicleId },
    });
  }
}