import {
  Injectable, NotFoundException, ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FilterUsersDto } from './dto/filter-users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        cin: true,
        drivingLicense: true,
        licenseExpiry: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (exists) throw new ConflictException('Cet email est déjà utilisé');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        cin: true,
        drivingLicense: true,
        licenseExpiry: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
      },
    });
    return user;
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) throw new ForbiddenException('Mot de passe actuel incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: 'Mot de passe modifié avec succès' };
  }

  async getAllUsers(dto: FilterUsersDto) {
    const { page, limit, search, isActive, role } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (isActive !== undefined) where.isActive = isActive;
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        cin: true,
        drivingLicense: true,
        licenseExpiry: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        bookings: {
          select: {
            id: true,
            bookingReference: true,
            startDate: true,
            endDate: true,
            status: true,
            totalAmount: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { bookings: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async toggleUserStatus(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (user.role === 'ADMIN') throw new ForbiddenException('Impossible de bloquer un admin');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
    return { message: `Utilisateur ${updated.isActive ? 'activé' : 'bloqué'}`, isActive: updated.isActive };
  }

  async getUserStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: { select: { bookings: true } },
        bookings: {
          select: { totalAmount: true },
        },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const totalSpent = user.bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    return {
      totalBookings: user._count.bookings,
      totalSpent,
      averageSpent: user._count.bookings > 0 ? totalSpent / user._count.bookings : 0,
    };
  }
}