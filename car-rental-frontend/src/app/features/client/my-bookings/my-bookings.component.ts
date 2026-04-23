// ═══════════════════════════════════════════════════════════════════════════
// MY BOOKINGS PAGE — Client Booking History
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingsService } from '../../../core/services/bookings.service';
import { Booking, BookingStatus } from '../../../core/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="my-bookings">
      <h1 class="my-bookings__title">Mes réservations</h1>
      <p class="my-bookings__subtitle">Consultez et gérez vos réservations.</p>

      <!-- Filter Tabs -->
      <div class="my-bookings__tabs">
        @for (tab of tabs(); track tab.value) {
          <button
            class="my-bookings__tab"
            [class.my-bookings__tab--active]="activeTab() === tab.value"
            (click)="activeTab.set(tab.value)"
          >
            {{ tab.label }}
            @if (tab.count > 0) {
              <span class="my-bookings__tab-count">{{ tab.count }}</span>
            }
          </button>
        }
      </div>

      <!-- Bookings List -->
      @if (isLoading()) {
        <div class="my-bookings__loading">
          <div class="my-bookings__skeleton"></div>
          <div class="my-bookings__skeleton"></div>
          <div class="my-bookings__skeleton"></div>
        </div>
      } @else if (filteredBookings().length === 0) {
        <div class="my-bookings__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p>Aucune réservation trouvée.</p>
          <a routerLink="/vehicles" class="my-bookings__empty-link">Réserver un véhicule</a>
        </div>
      } @else {
        <div class="my-bookings__list">
          @for (booking of filteredBookings(); track booking.id) {
            <a [routerLink]="['/dashboard/bookings', booking.id]" class="booking-card">
              <div class="booking-card__header">
                <div class="booking-card__ref">{{ booking.bookingReference }}</div>
                <span
                  class="booking-card__status"
                  [style.background]="getStatusBg(booking.status)"
                  [style.color]="bookingsService.getStatusColor(booking.status)"
                >
                  {{ bookingsService.getStatusLabel(booking.status) }}
                </span>
              </div>

              <div class="booking-card__body">
                <div class="booking-card__vehicle">
                  @if (booking.vehicle?.mainImageUrl) {
                    <img [src]="booking.vehicle!.mainImageUrl" [alt]="booking.vehicle?.brand" class="booking-card__vehicle-img" />
                  }
                  <div class="booking-card__vehicle-info">
                    <span class="booking-card__vehicle-name">
                      {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }}
                    </span>
                    <span class="booking-card__vehicle-year">{{ booking.vehicle?.year }}</span>
                  </div>
                </div>

                <div class="booking-card__details">
                  <div class="booking-card__detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{{ formatDate(booking.startDate) }} — {{ formatDate(booking.endDate) }}</span>
                  </div>
                  <div class="booking-card__detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{{ booking.durationDays }} jour{{ booking.durationDays > 1 ? 's' : '' }}</span>
                  </div>
                </div>
              </div>

              <div class="booking-card__footer">
                <span class="booking-card__amount">{{ formatPrice(booking.totalAmount) }}</span>
                <div class="booking-card__actions">
                  @if (bookingsService.canCancel(booking.status)) {
                    <button class="booking-card__action booking-card__action--cancel" (click)="onCancel($event, booking)">Annuler</button>
                  }
                  <span class="booking-card__action booking-card__action--view">Voir détails →</span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .my-bookings {
      max-width: 800px;
    }

    .my-bookings__title {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-section);
      margin: 0;
    }

    .my-bookings__subtitle {
      font-size: var(--text-body);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      margin-bottom: var(--space-6);
    }

    /* ── Tabs ── */
    .my-bookings__tabs {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
      overflow-x: auto;
      padding-bottom: var(--space-1);
    }

    .my-bookings__tab {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-pill);
      border: 1px solid var(--border-color);
      background: var(--bg-surface);
      color: var(--text-secondary);
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .my-bookings__tab:hover {
      background: var(--hover-bg);
    }
    .my-bookings__tab--active {
      background: var(--color-apple-blue);
      color: #ffffff;
      border-color: var(--color-apple-blue);
    }

    .my-bookings__tab-count {
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      min-width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-circle);
      background: rgba(255,255,255,0.2);
    }
    .my-bookings__tab:not(.my-bookings__tab--active) .my-bookings__tab-count {
      background: var(--hover-bg);
    }

    /* ── Loading ── */
    .my-bookings__loading {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .my-bookings__skeleton {
      height: 140px;
      border-radius: var(--radius-standard);
      background: var(--bg-secondary);
      animation: pulse 1.5s ease-in-out infinite;
    }

    /* ── Empty ── */
    .my-bookings__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-10) var(--space-4);
      text-align: center;
      color: var(--text-tertiary);
    }
    .my-bookings__empty svg {
      width: 40px;
      height: 40px;
      opacity: 0.48;
    }
    .my-bookings__empty-link {
      font-size: var(--text-link);
      color: var(--color-apple-blue);
      text-decoration: none;
    }
    .my-bookings__empty-link:hover {
      text-decoration: underline;
    }

    /* ── Booking Cards ── */
    .my-bookings__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .booking-card {
      display: flex;
      flex-direction: column;
      padding: var(--space-5);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-standard);
      text-decoration: none;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .booking-card:hover {
      background: var(--hover-bg);
    }

    .booking-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }

    .booking-card__ref {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
      font-variant-numeric: tabular-nums;
    }

    .booking-card__status {
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-pill);
    }

    .booking-card__body {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .booking-card__vehicle {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .booking-card__vehicle-img {
      width: 56px;
      height: 42px;
      object-fit: cover;
      border-radius: var(--radius-micro);
    }

    .booking-card__vehicle-info {
      display: flex;
      flex-direction: column;
    }

    .booking-card__vehicle-name {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .booking-card__vehicle-year {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
    }

    .booking-card__details {
      display: flex;
      gap: var(--space-5);
    }

    .booking-card__detail {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-micro);
      color: var(--text-secondary);
    }
    .booking-card__detail svg {
      width: 14px;
      height: 14px;
      color: var(--text-tertiary);
    }

    .booking-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: var(--space-4);
      padding-top: var(--space-3);
      border-top: 1px solid var(--border-color);
    }

    .booking-card__amount {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    .booking-card__actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .booking-card__action {
      font-size: var(--text-micro);
      cursor: pointer;
    }
    .booking-card__action--cancel {
      color: var(--color-error);
      background: none;
      border: none;
      font-family: var(--font-body);
      font-weight: var(--weight-regular);
    }
    .booking-card__action--cancel:hover {
      text-decoration: underline;
    }
    .booking-card__action--view {
      color: var(--color-apple-blue);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  readonly bookingsService = inject(BookingsService);

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _allBookings = signal<Booking[]>([]);
  readonly activeTab = signal<BookingStatus | 'ALL'>('ALL');

  readonly filteredBookings = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ALL') return this._allBookings();
    return this._allBookings().filter(b => b.status === tab);
  });

  readonly tabs = computed<{ label: string; value: BookingStatus | 'ALL'; count: number }[]>(() => [
    { label: 'Toutes', value: 'ALL', count: this._allBookings().length },
    { label: 'En attente', value: 'PENDING', count: this._allBookings().filter(b => b.status === 'PENDING').length },
    { label: 'Confirmées', value: 'CONFIRMED', count: this._allBookings().filter(b => b.status === 'CONFIRMED').length },
    { label: 'En cours', value: 'ACTIVE', count: this._allBookings().filter(b => b.status === 'ACTIVE').length },
    { label: 'Terminées', value: 'COMPLETED', count: this._allBookings().filter(b => b.status === 'COMPLETED').length },
    { label: 'Annulées', value: 'CANCELLED', count: this._allBookings().filter(b => b.status === 'CANCELLED').length },
  ]);

  ngOnInit(): void {
    this._isLoading.set(true);
    this.bookingsService.getMyBookings({ limit: 50 }).subscribe({
      next: (response) => {
        this._allBookings.set(response.data);
        this._isLoading.set(false);
      },
      error: () => {
        this._isLoading.set(false);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatPrice(price: number | string): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(num);
  }

  getStatusBg(status: BookingStatus): string {
    const bgs: Record<BookingStatus, string> = {
      'PENDING': 'rgba(255, 149, 0, 0.1)',
      'CONFIRMED': 'rgba(0, 113, 227, 0.1)',
      'ACTIVE': 'rgba(52, 199, 89, 0.1)',
      'COMPLETED': 'rgba(0,0,0,0.05)',
      'CANCELLED': 'rgba(255, 59, 48, 0.1)',
      'NO_SHOW': 'rgba(255, 59, 48, 0.1)'
    };
    return bgs[status] || 'transparent';
  }

  onCancel(event: Event, booking: Booking): void {
    event.preventDefault();
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.bookingsService.cancelBooking(booking.id).subscribe({
        next: () => {
          this._allBookings.update(list =>
            list.map(b => b.id === booking.id ? { ...b, status: 'CANCELLED' as BookingStatus } : b)
          );
        }
      });
    }
  }
}
