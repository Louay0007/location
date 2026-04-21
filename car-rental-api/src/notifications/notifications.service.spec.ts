import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const notificationData = {
        userId: 1,
        type: 'BOOKING_CREATED',
        title: 'Test Notification',
        message: 'Test message',
      };

      const expectedResult = { id: 1, ...notificationData, isRead: false, createdAt: new Date() };
      mockPrismaService.notification.create.mockResolvedValue(expectedResult);

      const result = await service.create(notificationData);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: notificationData,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated user notifications', async () => {
      const userId = 1;
      const page = 1;
      const limit = 20;
      const expectedNotifications = [
        { id: 1, userId, type: 'TEST', title: 'Test', message: 'Test', isRead: false, createdAt: new Date() },
      ];

      mockPrismaService.notification.findMany.mockResolvedValue(expectedNotifications);

      const result = await service.getUserNotifications(userId, page, limit);

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      });
      expect(result).toEqual(expectedNotifications);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const userId = 1;
      const notificationId = 1;
      const notification = { id: notificationId, userId, isRead: false };

      mockPrismaService.notification.findFirst.mockResolvedValue(notification);
      mockPrismaService.notification.update.mockResolvedValue({ ...notification, isRead: true });

      const result = await service.markAsRead(notificationId, userId);

      expect(mockPrismaService.notification.findFirst).toHaveBeenCalledWith({
        where: { id: notificationId, userId },
      });
      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { isRead: true },
      });
      expect(result).toEqual({ ...notification, isRead: true });
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      const userId = 1;
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(userId);

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual({ message: 'Toutes les notifications marquées comme lues' });
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const userId = 1;
      const count = 3;

      mockPrismaService.notification.count.mockResolvedValue(count);

      const result = await service.getUnreadCount(userId);

      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: { userId, isRead: false },
      });
      expect(result).toEqual({ count });
    });
  });
});
