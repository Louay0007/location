import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymeeService } from './paymee/paymee.service';
import { StripeService } from './stripe/stripe.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaService: PrismaService;
  let paymeeService: PaymeeService;
  let stripeService: StripeService;

  const mockPrismaService = {
    payment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPaymeeService = {
    refund: jest.fn(),
  };

  const mockStripeService = {
    refund: jest.fn(),
  };

  const mockPayment = {
    id: 1,
    bookingId: 1,
    amount: 100,
    currency: 'TND',
    paymentMethod: 'PAYMEE',
    status: 'PAID',
    gatewayPaymentId: 'paymee_token_123',
    gatewayResponse: {},
    transactionType: 'CHARGE',
    refundedAmount: 0,
    refundedAt: null,
    paidAt: new Date(),
    createdAt: new Date(),
    booking: {
      bookingReference: 'REF-2026-12345',
      client: { firstName: 'John', lastName: 'Doe' },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PaymeeService,
          useValue: mockPaymeeService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    paymeeService = module.get<PaymeeService>(PaymeeService);
    stripeService = module.get<StripeService>(StripeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirmByGatewayToken', () => {
    it('should confirm payment by gateway token', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(mockPayment);
      mockPrismaService.payment.update.mockResolvedValue(mockPayment);

      const result = await service.confirmByGatewayToken('paymee_token_123');

      expect(mockPrismaService.payment.findFirst).toHaveBeenCalledWith({
        where: { gatewayPaymentId: 'paymee_token_123' },
      });
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'PAID',
          paidAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(null);

      await expect(service.confirmByGatewayToken('invalid_token')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markFailed', () => {
    it('should mark payment as failed', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(mockPayment);
      mockPrismaService.payment.update.mockResolvedValue(mockPayment);

      const result = await service.markFailed('paymee_token_123');

      expect(mockPrismaService.payment.findFirst).toHaveBeenCalledWith({
        where: { gatewayPaymentId: 'paymee_token_123' },
      });
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'FAILED' },
      });
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(null);

      await expect(service.markFailed('invalid_token')).rejects.toThrow(NotFoundException);
    });
  });

  describe('refundPayment', () => {
    it('should refund Paymee payment', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPaymeeService.refund.mockResolvedValue({});
      mockPrismaService.payment.update.mockResolvedValue(mockPayment);

      const result = await service.refundPayment(1, 50);

      expect(mockPaymeeService.refund).toHaveBeenCalledWith('paymee_token_123', 50);
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          refundedAmount: { increment: 50 },
          refundedAt: expect.any(Date),
          transactionType: 'REFUND',
          status: 'PARTIAL',
        },
      });
      expect(result).toEqual({ message: 'Remboursement effectue', refundAmount: 50 });
    });

    it('should refund Stripe payment', async () => {
      const stripePayment = { ...mockPayment, paymentMethod: 'STRIPE' };
      mockPrismaService.payment.findUnique.mockResolvedValue(stripePayment);
      mockStripeService.refund.mockResolvedValue({});
      mockPrismaService.payment.update.mockResolvedValue(stripePayment);

      const result = await service.refundPayment(1, 50);

      expect(mockStripeService.refund).toHaveBeenCalledWith('paymee_token_123', 50);
      expect(result).toEqual({ message: 'Remboursement effectue', refundAmount: 50 });
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(service.refundPayment(999)).rejects.toThrow(NotFoundException);
    });

    it('should refund full amount if amount not specified', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPaymeeService.refund.mockResolvedValue({});
      mockPrismaService.payment.update.mockResolvedValue(mockPayment);

      await service.refundPayment(1);

      expect(mockPaymeeService.refund).toHaveBeenCalledWith('paymee_token_123', 100);
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments with booking info', async () => {
      const payments = [mockPayment];
      mockPrismaService.payment.findMany.mockResolvedValue(payments);

      const result = await service.getAllPayments();

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
        include: {
          booking: {
            select: {
              bookingReference: true,
              client: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(payments);
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by id', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById(1);

      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          booking: {
            select: {
              bookingReference: true,
              client: { select: { firstName: true, lastName: true, email: true } },
              vehicle: { select: { brand: true, model: true } },
            },
          },
        },
      });
      expect(result).toEqual(mockPayment);
    });

    it('should return null if not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      const result = await service.getPaymentById(999);
      expect(result).toBeNull();
    });
  });
});
