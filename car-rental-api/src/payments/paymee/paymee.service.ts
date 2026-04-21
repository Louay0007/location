import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymeeService {
  constructor(private config: ConfigService) {}

  async initiatePayment(params: {
    amount: number;
    bookingRef: string;
    bookingId: number;
    client: { firstName: string; lastName: string; email: string; phone: string };
  }) {
    const vendorToken = this.config.get('PAYMEE_VENDOR_TOKEN');
    const apiUrl = this.config.get('PAYMEE_API_URL');
    const appUrl = this.config.get('API_URL');
    const frontUrl = this.config.get('APP_URL');

    const payload = {
      vendor: vendorToken,
      amount: parseFloat(params.amount.toFixed(3)),
      note: `Location vehicule — ${params.bookingRef}`,
      first_name: params.client.firstName,
      last_name: params.client.lastName,
      email: params.client.email,
      phone: params.client.phone?.replace('+216', '') || '',
      return_url: `${frontUrl}/booking/success?ref=${params.bookingRef}`,
      cancel_url: `${frontUrl}/booking/cancel?ref=${params.bookingRef}`,
      webhook_url: `${appUrl}/api/v1/webhooks/paymee`,
      order_id: params.bookingId.toString(),
    };

    try {
      const response = await axios.post(`${apiUrl}/payments/create`, payload, {
        headers: {
          Authorization: `Token ${vendorToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data?.data?.token) {
        throw new BadRequestException('Erreur creation paiement Paymee');
      }

      return {
        token: response.data.data.token,
        paymentUrl: `https://app.paymee.tn/gateway/${response.data.data.token}`,
      };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new BadRequestException(`Paymee: ${message}`);
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.config.get('PAYMEE_WEBHOOK_SECRET');
    if (!secret) return true;
    
    try {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  async refund(paymentToken: string, amount: number) {
    const vendorToken = this.config.get('PAYMEE_VENDOR_TOKEN');
    const apiUrl = this.config.get('PAYMEE_API_URL');

    await axios.post(
      `${apiUrl}/payments/refund`,
      { token: paymentToken, amount: parseFloat(amount.toFixed(3)) },
      { headers: { Authorization: `Token ${vendorToken}` } },
    );
  }
}