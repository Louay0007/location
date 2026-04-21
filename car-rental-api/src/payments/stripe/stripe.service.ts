import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: any = null;

  constructor(private config: ConfigService) {
    const secretKey = this.config.get('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
  }

  async createPaymentIntent(params: {
    amountTND: number;
    bookingRef: string;
    bookingId: number;
    clientEmail: string;
  }) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe non configure');
    }

    const EUR_RATE = 3.3;
    const amountInEurCents = Math.round((params.amountTND / EUR_RATE) * 100);

    const intent = await this.stripe.paymentIntents.create({
      amount: amountInEurCents,
      currency: 'eur',
      metadata: {
        booking_ref: params.bookingRef,
        booking_id: params.bookingId.toString(),
        amount_tnd: params.amountTND.toString(),
      },
      receipt_email: params.clientEmail,
      description: `Location vehicule — ${params.bookingRef}`,
    });

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  constructWebhookEvent(payload: Buffer, signature: string): any {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret || !this.stripe) {
      throw new BadRequestException('Stripe webhook non configure');
    }
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async refund(paymentIntentId: string, amountTND?: number) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe non configure');
    }

    const params: any = {
      payment_intent: paymentIntentId,
    };

    if (amountTND) {
      const EUR_RATE = 3.3;
      params.amount = Math.round((amountTND / EUR_RATE) * 100);
    }

    return this.stripe.refunds.create(params);
  }
}