// ═══════════════════════════════════════════════════════════════════════════
// BOOKING DETAIL — Client Booking Detail View
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BookingsService } from '../../../core/services/bookings.service';
import { Booking } from '../../../core/models';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="booking-detail">
      @if (isLoading()) {
        <div class="booking-detail__loading"></div>
      } @else if (!booking()) {
        <div class="booking-detail__empty">
          <p>Réservation introuvable.</p>
          <a routerLink="/dashboard/bookings" class="booking-detail__back">Retour aux réservations</a>
        </div>
      } @else {
        <a routerLink="/dashboard/bookings" class="booking-detail__back-link">
          ← Mes réservations
        </a>

        <div class="booking-detail__header">
          <div>
            <h1 class="booking-detail__title">Réservation {{ booking()!.bookingReference }}</h1>
            <p class="booking-detail__date">Créée le {{ formatDate(booking()!.createdAt) }}</p>
          </div>
          <span
            class="booking-detail__status"
            [style.background]="getStatusBg(booking()!.status)"
            [style.color]="bookingsService.getStatusColor(booking()!.status)"
          >
            {{ bookingsService.getStatusLabel(booking()!.status) }}
          </span>
        </div>

        <!-- Vehicle Info -->
        <div class="booking-detail__card">
          <h2 class="booking-detail__card-title">Véhicule</h2>
          <div class="booking-detail__vehicle">
            @if (booking()!.vehicle?.mainImageUrl) {
              <img [src]="booking()!.vehicle!.mainImageUrl" [alt]="booking()!.vehicle?.brand" class="booking-detail__vehicle-img" />
            }
            <div class="booking-detail__vehicle-info">
              <span class="booking-detail__vehicle-name">{{ booking()!.vehicle?.brand }} {{ booking()!.vehicle?.model }}</span>
              <span class="booking-detail__vehicle-year">{{ booking()!.vehicle?.year }} · {{ booking()!.vehicle?.registration }}</span>
            </div>
          </div>
        </div>

        <!-- Rental Period -->
        <div class="booking-detail__card">
          <h2 class="booking-detail__card-title">Période de location</h2>
          <div class="booking-detail__period">
            <div class="booking-detail__period-item">
              <span class="booking-detail__period-label">Début</span>
              <span class="booking-detail__period-value">{{ formatDate(booking()!.startDate) }}</span>
              @if (booking()!.pickupTime) {
                <span class="booking-detail__period-time">{{ booking()!.pickupTime }}</span>
              }
            </div>
            <div class="booking-detail__period-divider">→</div>
            <div class="booking-detail__period-item">
              <span class="booking-detail__period-label">Fin</span>
              <span class="booking-detail__period-value">{{ formatDate(booking()!.endDate) }}</span>
              @if (booking()!.returnTime) {
                <span class="booking-detail__period-time">{{ booking()!.returnTime }}</span>
              }
            </div>
          </div>
          <div class="booking-detail__duration">
            Durée: <strong>{{ booking()!.durationDays }} jour{{ booking()!.durationDays > 1 ? 's' : '' }}</strong>
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="booking-detail__card">
          <h2 class="booking-detail__card-title">Détail du prix</h2>
          <div class="booking-detail__price-rows">
            <div class="booking-detail__price-row">
              <span>Tarif journalier</span>
              <span>{{ formatPrice(booking()!.dailyRate) }}</span>
            </div>
            <div class="booking-detail__price-row">
              <span>Sous-total ({{ booking()!.durationDays }} jours)</span>
              <span>{{ formatPrice(booking()!.subtotal) }}</span>
            </div>
            @if (hasDiscount()) {
              <div class="booking-detail__price-row booking-detail__price-row--discount">
                <span>Remise</span>
                <span>-{{ formatPrice(booking()!.discountAmount) }}</span>
              </div>
            }
            <div class="booking-detail__price-row">
              <span>Caution</span>
              <span>{{ formatPrice(booking()!.depositAmount) }}</span>
            </div>
            <div class="booking-detail__price-row booking-detail__price-row--total">
              <span>Total</span>
              <span>{{ formatPrice(booking()!.totalAmount) }}</span>
            </div>
          </div>
          <div class="booking-detail__payment-status">
            Paiement: <strong [style.color]="getPaymentColor()">{{ getPaymentLabel() }}</strong>
          </div>
        </div>

        <!-- Actions -->
        <div class="booking-detail__actions">
          @if (bookingsService.canCancel(booking()!.status)) {
            <button class="booking-detail__btn booking-detail__btn--danger" (click)="onCancel()">
              Annuler la réservation
            </button>
          }
          <a routerLink="/dashboard/bookings" class="booking-detail__btn booking-detail__btn--secondary">
            Retour
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .booking-detail {
      max-width: 700px;
    }

    .booking-detail__loading {
      height: 200px;
      border-radius: var(--radius-standard);
      background: var(--bg-secondary);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .booking-detail__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-10);
      text-align: center;
      color: var(--text-tertiary);
    }

    .booking-detail__back-link {
      font-size: var(--text-link);
      color: var(--color-apple-blue);
      text-decoration: none;
      margin-bottom: var(--space-6);
      display: inline-block;
    }
    .booking-detail__back-link:hover {
      text-decoration: underline;
    }

    .booking-detail__back {
      font-size: var(--text-link);
      color: var(--color-apple-blue);
      text-decoration: none;
    }

    /* ── Header ── */
    .booking-detail__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-6);
    }

    .booking-detail__title {
      font-family: var(--font-display);
      font-size: var(--text-tile);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tile);
      margin: 0;
    }

    .booking-detail__date {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
      margin-top: var(--space-1);
    }

    .booking-detail__status {
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-pill);
      white-space: nowrap;
    }

    /* ── Cards ── */
    .booking-detail__card {
      padding: var(--space-5);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-standard);
      margin-bottom: var(--space-4);
    }

    .booking-detail__card-title {
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: var(--text-secondary);
      letter-spacing: var(--tracking-link);
      margin: 0 0 var(--space-4) 0;
      text-transform: uppercase;
    }

    /* ── Vehicle ── */
    .booking-detail__vehicle {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .booking-detail__vehicle-img {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: var(--radius-micro);
    }

    .booking-detail__vehicle-info {
      display: flex;
      flex-direction: column;
    }

    .booking-detail__vehicle-name {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .booking-detail__vehicle-year {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
    }

    /* ── Period ── */
    .booking-detail__period {
      display: flex;
      align-items: center;
      gap: var(--space-5);
    }

    .booking-detail__period-item {
      display: flex;
      flex-direction: column;
    }

    .booking-detail__period-label {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
    }

    .booking-detail__period-value {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .booking-detail__period-time {
      font-size: var(--text-micro);
      color: var(--text-secondary);
    }

    .booking-detail__period-divider {
      font-size: var(--text-body);
      color: var(--text-tertiary);
    }

    .booking-detail__duration {
      margin-top: var(--space-3);
      font-size: var(--text-caption);
      color: var(--text-secondary);
    }

    /* ── Price ── */
    .booking-detail__price-rows {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .booking-detail__price-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-caption);
      color: var(--text-secondary);
    }

    .booking-detail__price-row--discount {
      color: var(--color-success);
    }

    .booking-detail__price-row--total {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      padding-top: var(--space-2);
      border-top: 1px solid var(--border-color);
      margin-top: var(--space-2);
    }

    .booking-detail__payment-status {
      margin-top: var(--space-3);
      font-size: var(--text-caption);
      color: var(--text-secondary);
    }

    /* ── Actions ── */
    .booking-detail__actions {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-6);
    }

    .booking-detail__btn {
      display: inline-flex;
      align-items: center;
      padding: 8px 15px;
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      cursor: pointer;
      text-decoration: none;
      transition: all var(--duration-fast) var(--ease-default);
      border: 1px solid transparent;
    }

    .booking-detail__btn--danger {
      background: var(--color-error);
      color: #ffffff;
      border: none;
    }
    .booking-detail__btn--danger:hover {
      filter: brightness(1.1);
    }

    .booking-detail__btn--secondary {
      background: var(--bg-surface);
      color: var(--text-primary);
      border-color: var(--border-color);
    }
    .booking-detail__btn--secondary:hover {
      background: var(--hover-bg);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class BookingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly bookingsService = inject(BookingsService);

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _booking = signal<Booking | null>(null);
  readonly booking = this._booking.asReadonly();

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this._isLoading.set(true);
    this.bookingsService.getMyBooking(id).subscribe({
      next: (booking) => {
        this._booking.set(booking);
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

  getStatusBg(status: string): string {
    const bgs: Record<string, string> = {
      'PENDING': 'rgba(255, 149, 0, 0.1)',
      'CONFIRMED': 'rgba(0, 113, 227, 0.1)',
      'ACTIVE': 'rgba(52, 199, 89, 0.1)',
      'COMPLETED': 'rgba(0,0,0,0.05)',
      'CANCELLED': 'rgba(255, 59, 48, 0.1)',
      'NO_SHOW': 'rgba(255, 59, 48, 0.1)'
    };
    return bgs[status] || 'transparent';
  }

  getPaymentLabel(): string {
    const status = this._booking()?.paymentStatus;
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'PAID': 'Payé',
      'PARTIAL': 'Partiel',
      'REFUNDED': 'Remboursé',
      'FAILED': 'Échoué'
    };
    return labels[status || ''] || status || '';
  }

  getPaymentColor(): string {
    const status = this._booking()?.paymentStatus;
    const colors: Record<string, string> = {
      'PENDING': 'var(--color-warning)',
      'PAID': 'var(--color-success)',
      'PARTIAL': 'var(--color-warning)',
      'REFUNDED': 'var(--color-apple-blue)',
      'FAILED': 'var(--color-error)'
    };
    return colors[status || ''] || 'var(--text-secondary)';
  }

  hasDiscount(): boolean {
    const booking = this._booking();
    if (!booking) return false;
    return Number(booking.discountAmount) > 0;
  }

  onCancel(): void {
    const booking = this._booking();
    if (!booking) return;
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.bookingsService.cancelBooking(booking.id).subscribe({
        next: (updated) => {
          this._booking.set(updated);
        }
      });
    }
  }
}
