// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD SERVICE — Admin Dashboard KPIs & Analytics
// ═══════════════════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import {
  DashboardKPI,
  RevenueChart,
  BookingsByStatus,
  FleetOccupation,
  TopVehicle,
  PaymentMethodDistribution,
  MaintenanceStats
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  getKPIs(): Observable<DashboardKPI> {
    return this.api.getRaw<DashboardKPI>('/dashboard/admin/kpis');
  }

  getRevenueByMonth(months: number = 12): Observable<RevenueChart[]> {
    return this.api.getRaw<RevenueChart[]>('/dashboard/admin/revenue', { months });
  }

  getBookingsByStatus(): Observable<BookingsByStatus[]> {
    return this.api.getRaw<BookingsByStatus[]>('/dashboard/admin/bookings-status');
  }

  getFleetOccupancy(days: number = 30): Observable<FleetOccupation[]> {
    return this.api.getRaw<FleetOccupation[]>('/dashboard/admin/fleet-occupation', { days });
  }

  getTopVehicles(limit: number = 5): Observable<TopVehicle[]> {
    return this.api.getRaw<TopVehicle[]>('/dashboard/admin/top-vehicles', { limit });
  }

  getPaymentMethodsDistribution(): Observable<PaymentMethodDistribution[]> {
    return this.api.getRaw<PaymentMethodDistribution[]>('/dashboard/admin/payment-methods');
  }

  getRecentBookings(limit: number = 10): Observable<any[]> {
    return this.api.getRaw<any[]>('/dashboard/admin/recent-bookings', { limit });
  }

  getMaintenanceStats(): Observable<MaintenanceStats> {
    return this.api.getRaw<MaintenanceStats>('/dashboard/admin/maintenance-stats');
  }
}
