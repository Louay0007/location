import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FilterUsersDto } from './dto/filter-users.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+21612345678',
    cin: '12345678',
    drivingLicense: 'DL123456',
    licenseExpiry: new Date('2025-12-31'),
    role: 'CLIENT',
    avatarUrl: 'https://example.com/avatar.jpg',
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date(),
    passwordHash: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.objectContaining({
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const dto: UpdateProfileDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+21687654321',
      };

      const updatedUser = { ...mockUser, ...dto };
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(1, dto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining(dto),
        select: expect.any(Object),
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto: UpdateProfileDto = { email: 'existing@example.com' };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.updateProfile(1, dto)).rejects.toThrow(ConflictException);
    });

    it('should handle licenseExpiry date conversion', async () => {
      const dto: UpdateProfileDto = {
        licenseExpiry: '2026-12-31',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.updateProfile(1, dto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          licenseExpiry: expect.any(Date),
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const dto = { currentPassword: 'oldPassword', newPassword: 'newPassword' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword' as never);
      mockPrismaService.user.update.mockResolvedValue(mockUser as never);

      const result = await service.changePassword(1, dto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', mockUser.passwordHash);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 12);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { passwordHash: 'newHashedPassword' },
      });
      expect(result).toEqual({ message: 'Mot de passe modifié avec succès' });
    });

    it('should throw NotFoundException if user not found', async () => {
      const dto = { currentPassword: 'oldPassword', newPassword: 'newPassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if current password is incorrect', async () => {
      const dto = { currentPassword: 'wrongPassword', newPassword: 'newPassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(service.changePassword(1, dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const dto: FilterUsersDto = { page: 1, limit: 20, search: 'John', isActive: true, role: 'CLIENT' };
      const users = [mockUser];
      const total = 1;

      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(total);

      const result = await service.getAllUsers(dto);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          isActive: true,
          role: 'CLIENT',
          OR: expect.arrayContaining([
            { firstName: { contains: 'John', mode: 'insensitive' } },
          ]),
        }),
        skip: 0,
        take: 20,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: users,
        meta: { page: 1, limit: 20, total, totalPages: 1 },
      });
    });
  });

  describe('getUserById', () => {
    it('should return user with bookings', async () => {
      const userWithBookings = {
        ...mockUser,
        bookings: [
          { id: 1, bookingReference: 'REF-2026-12345', startDate: new Date(), endDate: new Date(), status: 'CONFIRMED', totalAmount: 100 },
        ],
        _count: { bookings: 1 },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithBookings);

      const result = await service.getUserById(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.objectContaining({
          bookings: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
      expect(result).toEqual(userWithBookings);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle user status', async () => {
      const updatedUser = { ...mockUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.toggleUserStatus(1);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual({ message: 'Utilisateur bloqué', isActive: false });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.toggleUserStatus(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for admin users', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };
      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);

      await expect(service.toggleUserStatus(1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const userWithStats = {
        _count: { bookings: 5 },
        bookings: [
          { totalAmount: 100 },
          { totalAmount: 200 },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithStats);

      const result = await service.getUserStats(1);

      expect(result).toEqual({
        totalBookings: 5,
        totalSpent: 300,
        averageSpent: 60,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserStats(999)).rejects.toThrow(NotFoundException);
    });

    it('should handle zero bookings', async () => {
      const userWithStats = {
        _count: { bookings: 0 },
        bookings: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithStats);

      const result = await service.getUserStats(1);

      expect(result).toEqual({
        totalBookings: 0,
        totalSpent: 0,
        averageSpent: 0,
      });
    });
  });
});
