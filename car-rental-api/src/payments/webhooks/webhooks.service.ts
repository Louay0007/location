import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymeeService } from '../paymee/paymee.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private paymeeService: PaymeeService,
    private stripeService: StripeService,
  ) {}

  async handlePaymeeWebhook(body: any, signature: string) {
    const rawBody = JSON.stringify(body);

    if (!this.paymeeService.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn('Signature Paymee invalide');
      return { received: true };
    }

    this.logger.log(`Webhook Paymee recu: ${body.status} — Order: ${body.order_id}`);

    if (body.status === true || body.payment_status === 'SUCCESS') {
      const bookingId = parseInt(body.order_id);
      
      await this.prisma.payment.create({
        data: {
          bookingId,
          amount: body.amount,
          paymentMethod: 'PAYMEE',
          gatewayPaymentId: body.token,
          gatewayResponse: body,
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: 'PAYMEE',
        },
      });

      this.logger.log(`Paiement confirme pour reservation ${bookingId}`);
    }

    return { received: true };
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    let event: any;

    try {
      event = this.stripeService.constructWebhookEvent(payload, signature);
    } catch (err) {
      this.logger.warn(`Webhook Stripe invalide: ${err.message}`);
      return { received: true };
    }

    this.logger.log(`Webhook Stripe: ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const bookingId = parseInt(intent.metadata.booking_id);

      await this.prisma.payment.create({
        data: {
          bookingId,
          amount: intent.metadata.amount_tnd ? parseFloat(intent.metadata.amount_tnd) : 0,
          paymentMethod: 'STRIPE',
          gatewayPaymentId: intent.id,
          gatewayResponse: intent,
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: 'STRIPE',
        },
      });

      this.logger.log(`Paiement Stripe confirme pour reservation ${bookingId}`);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      this.logger.warn(`Paiement echoue: ${intent.id}`);
    }

    return { received: true };
  }
}