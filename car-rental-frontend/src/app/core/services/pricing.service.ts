// ═══════════════════════════════════════════════════════════════════════════
// PRICING SERVICE — Price Rules Management
// ═══════════════════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PriceRule } from '../models';

export interface CreatePriceRuleRequest {
  name: string;
  type: 'SEASONAL' | 'PROMO' | 'DISCOUNT';
  startDate: string;
  endDate?: string;
  discountPercent?: number;
  fixedDiscount?: number;
  minDays?: number;
  vehicleIds?: number[];
  categoryIds?: number[];
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  constructor(private readonly api: ApiService) {}

  getActivePriceRules(): Observable<PriceRule[]> {
    return this.api.getRaw<PriceRule[]>('/pricing/rules');
  }

  getAllPriceRules(): Observable<PriceRule[]> {
    return this.api.getRaw<PriceRule[]>('/pricing/admin/rules');
  }

  getPriceRuleById(id: number): Observable<PriceRule> {
    return this.api.getRaw<PriceRule>(`/pricing/admin/rules/${id}`);
  }

  createPriceRule(data: CreatePriceRuleRequest): Observable<PriceRule> {
    return this.api.postRaw<PriceRule>('/pricing/admin/rules', data);
  }

  updatePriceRule(id: number, data: Partial<CreatePriceRuleRequest>): Observable<PriceRule> {
    return this.api.putRaw<PriceRule>(`/pricing/admin/rules/${id}`, data);
  }

  togglePriceRule(id: number): Observable<PriceRule> {
    return this.api.patchRaw<PriceRule>(`/pricing/admin/rules/${id}/toggle`, {});
  }

  deletePriceRule(id: number): Observable<void> {
    return this.api.deleteRaw<void>(`/pricing/admin/rules/${id}`);
  }
}
