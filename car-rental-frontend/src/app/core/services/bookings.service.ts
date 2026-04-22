// ═════════════════════════════════════════════════════════════════════════════════════════
// BOOKINGS SERVICE — Reservation Management
// ═════════════════════════════════════════════════════════════════════════════════════════

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  Booking,
  BookingListResponse,
  CreateBookingRequest,
  BookingStatus,
  Payment,
  DateRange,
  SearchParams
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private readonly api = inject(ApiService);

  // ─────────────────────────────────────────────────────────────────────────
  // State Management
  // ─────────────────────────────────────────────────────────────────────────

  private readonly _bookings = signal<Booking[]>([]);
  private readonly _selectedBooking = signal<Booking | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _totalCount = signal<number>(0);

  readonly bookings = this._bookings.asReadonly();
  readonly selectedBooking = this._selectedBooking.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();

  readonly activeBookings = computed(() =>
    this._bookings().filter(b =>
      b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'ACTIVE'
    )
  );

  readonly pastBookings = computed(() =>
    this._bookings().filter(b =>
      b.status === 'COMPLETED' || b.status === 'CANCELLED'
    )
  );

  readonly upcomingBookings = computed(() => {
    const now = new Date();
    return this._bookings().filter(b =>
      new Date(b.startDate) > now &&
      (b.status === 'CONFIRMED' || b.status === 'ACTIVE')
    ).sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Client Methods
  // ─────────────────────────────────────────────────────────────────────────

  getMyBookings(filters?: {
    status?: BookingStatus;
    page?: number;
    limit?: number;
  }): Observable<BookingListResponse> {
    this._isLoading.set(true);
    return this.api.getRaw<BookingListResponse>('/bookings/my', filters).pipe(
      tap(response => {
        this._bookings.set(response.data);
        this._totalCount.set(response.meta.total);
        this._isLoading.set(false);
      })
    );
  }

  getMyBooking(id: number): Observable<Booking> {
    return this.api.getRaw<Booking>(`/bookings/my/${id}`).pipe(
      tap(booking => this._selectedBooking.set(booking))
    );
  }

  createBooking(data: CreateBookingRequest): Observable<Booking> {
    this._isLoading.set(true);
    return this.api.postRaw<Booking>('/bookings', data).pipe(
      tap(booking => {
        this._selectedBooking.set(booking);
        this._isLoading.set(false);
      })
    );
  }

  cancelBooking(id: number, reason?: string): Observable<Booking> {
    return this.api.postRaw<Booking>(`/bookings/${id}/cancel`, { reason }).pipe(
      tap(booking => {
        this._selectedBooking.set(booking);
        this.updateBookingInList(booking);
      })
    );
  }

  getBookingContract(id: number): Observable<Blob> {
    return this.api.getRaw<Blob>(`/bookings/${id}/contract`);
  }

  getBookingInvoice(id: number): Observable<Blob> {
    return this.api.getRaw<Blob>(`/bookings/${id}/invoice`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Booking Step Helpers (Wizard)
  // ─────────────────────────────────────────────────────────────────────────

  calculatePrice(vehicleId: number, dates: DateRange): Observable<{
    dailyRate: number;
    subtotal: number;
    discountAmount: number;
    depositAmount: number;
    totalAmount: number;
    durationDays: number;
  }> {
    return this.api.postRaw<{
      dailyRate: number;
      subtotal: number;
      discountAmount: number;
      depositAmount: number;
      totalAmount: number;
      durationDays: number;
    }>('/bookings/calculate', { vehicleId, ...dates });
  }

  validateDates(vehicleId: number, dates: DateRange): Observable<{
    valid: boolean;
    unavailableDates?: string[];
  }> {
    return this.api.postRaw<{
      valid: boolean;
      unavailableDates?: string[];
    }>('/bookings/validate', { vehicleId, ...dates });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // State Helpers
  // ─────────────────────────────────────────────────────────────────────────

  private updateBookingInList(booking: Booking): void {
    const current = this._bookings();
    const index = current.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      const updated = [...current];
      updated[index] = booking;
      this._bookings.set(updated);
    }
  }

  clearSelection(): void {
    this._selectedBooking.set(null);
  }

  clearAll(): void {
    this._bookings.set([]);
    this._selectedBooking.set(null);
    this._totalCount.set(0);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status Helpers
  // ─────────────────────────────────────────────────────────────────────────

  getStatusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmée',
      'ACTIVE': 'En cours',
      'COMPLETED': 'Terminée',
      'CANCELLED': 'Annulée',
      'NO_SHOW': 'No-show'
    };
    return labels[status] || status;
  }

  getStatusColor(status: BookingStatus): string {
    const colors: Record<BookingStatus, string> = {
      'PENDING': 'var(--color-warning)',
      'CONFIRMED': 'var(--color-apple-blue)',
      'ACTIVE': 'var(--color-success)',
      'COMPLETED': 'var(--color-text-secondary)',
      'CANCELLED': 'var(--color-error)',
      'NO_SHOW': 'var(--color-error)'
    };
    return colors[status] || 'var(--color-text-secondary)';
  }

  canCancel(status: BookingStatus): boolean {
    return ['PENDING', 'CONFIRMED'].includes(status);
  }

  canModify(status: BookingStatus): boolean {
    return status === 'PENDING';
  }

  canLeaveReview(status: BookingStatus): boolean {
    return status === 'COMPLETED';
  }
}