// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT SERVICE — Stripe & Paymee Integration
// ═══════════════════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Payment, PaginationMeta } from '../models';

export interface PaymeeInitiateRequest {
  bookingId: number;
}

export interface PaymeeInitiateResponse {
  paymentUrl: string;
  reference: string;
  amount: number;
}

export interface StripeIntentRequest {
  bookingId: number;
}

export interface StripeIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PaymentListResponse {
  data: Payment[];
  meta: PaginationMeta;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private readonly api: ApiService) {}

  initiatePaymee(data: PaymeeInitiateRequest): Observable<PaymeeInitiateResponse> {
    return this.api.postRaw<PaymeeInitiateResponse>('/paymee/initiate', data);
  }

  createStripeIntent(data: StripeIntentRequest): Observable<StripeIntentResponse> {
    return this.api.postRaw<StripeIntentResponse>('/stripe/create-intent', data);
  }

  getAllPayments(): Observable<PaymentListResponse> {
    return this.api.getRaw<PaymentListResponse>('/payments/admin');
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.api.getRaw<Payment>(`/payments/admin/${id}`);
  }

  refundPayment(id: number, amount?: number): Observable<Payment> {
    return this.api.postRaw<Payment>(`/payments/admin/${id}/refund`, { amount });
  }
}
