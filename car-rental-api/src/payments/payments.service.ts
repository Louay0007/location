import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async confirmByGatewayToken(gatewayId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { gatewayPaymentId: gatewayId } });
    if (!payment) throw new NotFoundException('Paiement non trouve');

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'PAID',
        paidAt: new Date(),
      },
    });
    return payment;
  }

  async markFailed(gatewayId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { gatewayPaymentId: gatewayId } });
    if (!payment) throw new NotFoundException('Paiement non trouve');

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
  }

  async refundPayment(paymentId: number, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });
    if (!payment) throw new NotFoundException('Paiement non trouve');

    const refundAmount = amount || Number(payment.amount) - Number(payment.refundedAmount);

    if (payment.paymentMethod === 'PAYMEE' && payment.gatewayPaymentId) {
    } else if (payment.paymentMethod === 'STRIPE' && payment.gatewayPaymentId) {
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        refundedAmount: { increment: refundAmount },
        refundedAt: new Date(),
        transactionType: 'REFUND',
        status: Number(payment.refundedAmount) + refundAmount >= Number(payment.amount) ? 'REFUNDED' : 'PARTIAL',
      },
    });

    return { message: 'Remboursement effectue', refundAmount };
  }

  async getAllPayments() {
    return this.prisma.payment.findMany({
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
  }

  async getPaymentById(id: number) {
    return this.prisma.payment.findUnique({
      where: { id },
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
  }
}