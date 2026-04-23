// ═══════════════════════════════════════════════════════════════════════════
// BOOKING CONFIRMATION — Success Page
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BookingsService } from '../../../core/services/bookings.service';
import { Booking } from '../../../core/models';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirmation">
      @if (isLoading()) {
        <div class="confirmation__loading"></div>
      } @else {
        <div class="confirmation__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h1 class="confirmation__title">Réservation confirmée !</h1>
        <p class="confirmation__subtitle">Votre réservation a été créée avec succès.</p>

        @if (booking()) {
          <div class="confirmation__card">
            <div class="confirmation__ref">
              Référence: <strong>{{ booking()!.bookingReference }}</strong>
            </div>
            <div class="confirmation__info">
              <div class="confirmation__row">
                <span class="confirmation__label">Véhicule</span>
                <span class="confirmation__value">{{ booking()!.vehicle?.brand }} {{ booking()!.vehicle?.model }}</span>
              </div>
              <div class="confirmation__row">
                <span class="confirmation__label">Dates</span>
                <span class="confirmation__value">{{ formatDate(booking()!.startDate) }} — {{ formatDate(booking()!.endDate) }}</span>
              </div>
              <div class="confirmation__row">
                <span class="confirmation__label">Total</span>
                <span class="confirmation__value confirmation__value--price">{{ formatPrice(booking()!.totalAmount) }}</span>
              </div>
            </div>
          </div>
        }

        <p class="confirmation__email-info">
          Un email de confirmation a été envoyé à votre adresse email.
        </p>

        <div class="confirmation__actions">
          <a routerLink="/dashboard/bookings" class="confirmation__btn confirmation__btn--primary">
            Voir mes réservations
          </a>
          <a routerLink="/vehicles" class="confirmation__btn confirmation__btn--secondary">
            Continuer la navigation
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .confirmation {
      max-width: 500px;
      margin: 0 auto;
      padding: var(--space-12) var(--space-6);
      text-align: center;
    }

    .confirmation__loading {
      height: 200px;
      border-radius: var(--radius-standard);
      background: var(--bg-secondary);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .confirmation__icon {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-circle);
      background: rgba(52, 199, 89, 0.1);
      color: var(--color-success);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-6);
    }
    .confirmation__icon svg {
      width: 32px;
      height: 32px;
    }

    .confirmation__title {
      font-family: var(--font-display);
      font-size: var(--text-tile);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tile);
      margin: 0;
    }

    .confirmation__subtitle {
      font-size: var(--text-body);
      color: var(--text-secondary);
      margin-top: var(--space-2);
      margin-bottom: var(--space-8);
    }

    .confirmation__card {
      padding: var(--space-5);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-standard);
      text-align: left;
      margin-bottom: var(--space-6);
    }

    .confirmation__ref {
      font-size: var(--text-caption);
      color: var(--text-secondary);
      margin-bottom: var(--space-4);
    }
    .confirmation__ref strong {
      color: var(--color-apple-blue);
      font-variant-numeric: tabular-nums;
    }

    .confirmation__row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-1) 0;
    }

    .confirmation__label {
      font-size: var(--text-caption);
      color: var(--text-tertiary);
    }

    .confirmation__value {
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .confirmation__value--price {
      font-size: var(--text-body);
      font-variant-numeric: tabular-nums;
    }

    .confirmation__email-info {
      font-size: var(--text-caption);
      color: var(--text-tertiary);
      margin-bottom: var(--space-8);
    }

    .confirmation__actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      align-items: center;
    }

    .confirmation__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 24px;
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      text-decoration: none;
      transition: all var(--duration-fast) var(--ease-default);
      border: 1px solid transparent;
    }

    .confirmation__btn--primary {
      background: var(--color-apple-blue);
      color: #ffffff;
      width: 100%;
    }
    .confirmation__btn--primary:hover {
      background: var(--color-apple-blue-hover);
    }

    .confirmation__btn--secondary {
      background: var(--bg-surface);
      color: var(--text-primary);
      border-color: var(--border-color);
    }
    .confirmation__btn--secondary:hover {
      background: var(--hover-bg);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingsService = inject(BookingsService);

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
}
