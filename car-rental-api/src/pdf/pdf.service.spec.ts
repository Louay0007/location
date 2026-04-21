import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PdfService', () => {
  let service: PdfService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    booking: {
      findUnique: jest.fn(),
    },
  };

  const mockBooking = {
    id: 1,
    bookingReference: 'REF-2026-12345',
    startDate: new Date('2026-04-21'),
    endDate: new Date('2026-04-25'),
    pickupTime: '09:00',
    returnTime: '18:00',
    durationDays: 4,
    dailyRate: 100,
    subtotal: 400,
    discountAmount: 0,
    totalAmount: 400,
    depositAmount: 200,
    client: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+21612345678',
      cin: '12345678',
      drivingLicense: 'DL123456',
    },
    vehicle: {
      brand: 'Toyota',
      model: 'Corolla',
      registration: 'AB-123-TU',
      category: 'SEDAN',
      mainImageUrl: 'https://example.com/image.jpg',
    },
    payments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateContract', () => {
    it('should generate contract PDF', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const pdfBuffer = Buffer.from('PDF content');
      jest.spyOn(service as any, 'createContractPdf').mockResolvedValue(pdfBuffer);

      const result = await service.generateContract(1);

      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          client: true,
          vehicle: true,
        },
      });
      expect(service['createContractPdf']).toHaveBeenCalledWith(mockBooking);
      expect(result).toEqual(pdfBuffer);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.generateContract(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateInvoice', () => {
    it('should generate invoice PDF', async () => {
      const bookingWithPayments = {
        ...mockBooking,
        payments: [
          { amount: 400, status: 'PAID' },
        ],
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(bookingWithPayments);

      const pdfBuffer = Buffer.from('PDF content');
      jest.spyOn(service as any, 'createInvoicePdf').mockResolvedValue(pdfBuffer);

      const result = await service.generateInvoice(1);

      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          client: true,
          vehicle: true,
          payments: {
            where: { status: 'PAID' },
          },
        },
      });
      expect(service['createInvoicePdf']).toHaveBeenCalledWith(bookingWithPayments);
      expect(result).toEqual(pdfBuffer);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.generateInvoice(999)).rejects.toThrow(NotFoundException);
    });
  });
});
