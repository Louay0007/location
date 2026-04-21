import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('uuid');
jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockMailService = {
    sendWelcome: jest.fn(),
    sendPasswordReset: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: 'hashedPassword',
    isActive: true,
    role: 'CLIENT',
    refreshToken: 'refreshToken',
    avatarUrl: null,
  };

  beforeEach(async () => {
    (uuidv4 as jest.Mock).mockReturnValue('mock-uuid-token');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      const result = await service.validateUser('test@example.com', 'wrongPassword');

      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
        phone: '+21612345678',
        cin: '12345678',
        drivingLicense: 'DL123456',
        licenseExpiry: '2025-12-31',
      };

      const createdUser = {
        id: 2,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'CLIENT',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword' as never);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockMailService.sendWelcome.mockResolvedValue(null as never);

      const result = await service.register(dto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash: 'hashedPassword',
          licenseExpiry: expect.any(Date),
          phone: dto.phone,
          cin: dto.cin,
          drivingLicense: dto.drivingLicense,
          emailVerifyToken: expect.any(String),
        }),
        select: expect.any(Object),
      });
      expect(mockMailService.sendWelcome).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Compte créé. Veuillez vérifier votre email.', user: createdUser });
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const dto: LoginDto = { email: 'test@example.com', password: 'password' };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');

      const result = await service.login(dto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        user: expect.any(Object),
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const dto: LoginDto = { email: 'test@example.com', password: 'wrongPassword' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens with valid refresh token', async () => {
      const refreshToken = 'validRefreshToken';
      const payload = { sub: 1, email: 'test@example.com', role: 'CLIENT' };
      const userWithRefreshToken = { ...mockUser, refreshToken };

      mockJwtService.verify.mockReturnValue(payload);
      mockPrismaService.user.findUnique.mockResolvedValue(userWithRefreshToken);
      mockPrismaService.user.update.mockResolvedValue(userWithRefreshToken);
      mockJwtService.sign.mockReturnValueOnce('newAccessToken').mockReturnValueOnce('newRefreshToken');

      const result = await service.refresh(refreshToken);

      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: payload.sub } });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: payload.sub },
        data: { refreshToken: 'newRefreshToken' },
      });
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
        user: expect.any(Object),
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh('invalidToken')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token does not match', async () => {
      const payload = { sub: 1 };
      const userWithDifferentToken = { ...mockUser, refreshToken: 'differentToken' };

      mockJwtService.verify.mockReturnValue(payload);
      mockPrismaService.user.findUnique.mockResolvedValue(userWithDifferentToken);

      await expect(service.refresh('invalidToken')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const token = 'validToken';
      const userWithToken = { ...mockUser, emailVerifyToken: token };

      mockPrismaService.user.findFirst.mockResolvedValue(userWithToken);
      mockPrismaService.user.update.mockResolvedValue(userWithToken);

      const result = await service.verifyEmail(token);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerifyToken: token },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { isEmailVerified: true, emailVerifyToken: null },
      });
      expect(result).toEqual({ message: 'Email vérifié avec succès' });
    });

    it('should throw BadRequestException with invalid token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('invalidToken')).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockMailService.sendPasswordReset.mockResolvedValue(null as never);

      const result = await service.forgotPassword(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          resetToken: expect.any(String),
          resetTokenExpiry: expect.any(Date),
        },
      });
      expect(mockMailService.sendPasswordReset).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Lien de réinitialisation envoyé' });
    });

    it('should return message even if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toEqual({ message: 'Si cet email existe, un lien a été envoyé' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'validToken';
      const newPassword = 'newPassword123';
      const userWithToken = { ...mockUser, resetToken: token, resetTokenExpiry: new Date(Date.now() + 3600000) };

      mockPrismaService.user.findFirst.mockResolvedValue(userWithToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword' as never);
      mockPrismaService.user.update.mockResolvedValue(userWithToken);

      const result = await service.resetPassword(token, newPassword);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { resetToken: token, resetTokenExpiry: { gte: expect.any(Date) } },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          passwordHash: 'newHashedPassword',
          resetToken: null,
          resetTokenExpiry: null,
          refreshToken: null,
        },
      });
      expect(result).toEqual({ message: 'Mot de passe réinitialisé avec succès' });
    });

    it('should throw BadRequestException with invalid token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword('invalidToken', 'newPassword')).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.logout(1);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { refreshToken: null },
      });
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });
  });
});
