// ═══════════════════════════════════════════════════════════════════════════
// CLIENT DASHBOARD — Overview Page
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookingsService } from '../../../core/services/bookings.service';
import { Booking, BookingStatus } from '../../../core/models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="dashboard__header">
        <div>
          <h1 class="dashboard__title">Bonjour, {{ authService.user()?.firstName }}</h1>
          <p class="dashboard__subtitle">Bienvenue dans votre espace personnel.</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="dashboard__stats">
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-card__info">
            <span class="stat-card__value">{{ stats().totalBookings }}</span>
            <span class="stat-card__label">Réservations</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-card__info">
            <span class="stat-card__value">{{ stats().activeRentals }}</span>
            <span class="stat-card__label">Locations actives</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-card__info">
            <span class="stat-card__value">{{ formatPrice(stats().totalSpent) }}</span>
            <span class="stat-card__label">Total dépensé</span>
          </div>
        </div>
      </div>

      <!-- Upcoming Rentals -->
      <section class="dashboard__section">
        <div class="dashboard__section-header">
          <h2 class="dashboard__section-title">Prochaines locations</h2>
          <a routerLink="/dashboard/bookings" class="dashboard__section-link">Voir tout</a>
        </div>
        @if (upcomingBookings().length === 0) {
          <div class="dashboard__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p>Aucune location à venir.</p>
            <a routerLink="/vehicles" class="dashboard__empty-link">Réserver un véhicule</a>
          </div>
        } @else {
          <div class="dashboard__bookings-list">
            @for (booking of upcomingBookings(); track booking.id) {
              <a [routerLink]="['/dashboard/bookings', booking.id]" class="booking-item">
                <div class="booking-item__info">
                  <span class="booking-item__vehicle">
                    {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }}
                  </span>
                  <span class="booking-item__dates">
                    {{ formatDate(booking.startDate) }} — {{ formatDate(booking.endDate) }}
                  </span>
                </div>
                <span
                  class="booking-item__status"
                  [style.color]="bookingsService.getStatusColor(booking.status)"
                >
                  {{ bookingsService.getStatusLabel(booking.status) }}
                </span>
              </a>
            }
          </div>
        }
      </section>

      <!-- Recent Activity -->
      <section class="dashboard__section">
        <div class="dashboard__section-header">
          <h2 class="dashboard__section-title">Activité récente</h2>
        </div>
        @if (recentBookings().length === 0) {
          <div class="dashboard__empty">
            <p>Aucune activité récente.</p>
          </div>
        } @else {
          <div class="dashboard__bookings-list">
            @for (booking of recentBookings(); track booking.id) {
              <a [routerLink]="['/dashboard/bookings', booking.id]" class="booking-item">
                <div class="booking-item__info">
                  <span class="booking-item__vehicle">
                    {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }}
                  </span>
                  <span class="booking-item__dates">
                    {{ formatDate(booking.startDate) }} — {{ formatDate(booking.endDate) }}
                  </span>
                </div>
                <span class="booking-item__amount">{{ formatPrice(booking.totalAmount) }}</span>
              </a>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 900px;
    }

    .dashboard__header {
      margin-bottom: var(--space-8);
    }

    .dashboard__title {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-section);
      margin: 0;
    }

    .dashboard__subtitle {
      font-size: var(--text-body);
      color: var(--text-secondary);
      margin-top: var(--space-1);
    }

    /* ── Stats ── */
    .dashboard__stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-8);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-5);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-standard);
    }

    .stat-card__icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-standard);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-card__icon svg {
      width: 22px;
      height: 22px;
    }
    .stat-card__icon--blue {
      background: rgba(0, 113, 227, 0.1);
      color: var(--color-apple-blue);
    }
    .stat-card__icon--green {
      background: rgba(52, 199, 89, 0.1);
      color: var(--color-success);
    }
    .stat-card__icon--orange {
      background: rgba(255, 149, 0, 0.1);
      color: var(--color-warning);
    }

    .stat-card__info {
      display: flex;
      flex-direction: column;
    }
    .stat-card__value {
      font-family: var(--font-display);
      font-size: var(--text-subheading);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      line-height: var(--leading-card);
    }
    .stat-card__label {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
      letter-spacing: var(--tracking-micro);
    }

    /* ── Sections ── */
    .dashboard__section {
      margin-bottom: var(--space-8);
    }

    .dashboard__section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }

    .dashboard__section-title {
      font-family: var(--font-display);
      font-size: var(--text-tile);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tile);
      margin: 0;
    }

    .dashboard__section-link {
      font-size: var(--text-link);
      color: var(--color-apple-blue);
      text-decoration: none;
      letter-spacing: var(--tracking-link);
    }
    .dashboard__section-link:hover {
      text-decoration: underline;
    }

    /* ── Empty State ── */
    .dashboard__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-10) var(--space-4);
      text-align: center;
      color: var(--text-tertiary);
    }
    .dashboard__empty svg {
      width: 40px;
      height: 40px;
      opacity: 0.48;
    }
    .dashboard__empty-link {
      font-size: var(--text-link);
      color: var(--color-apple-blue);
      text-decoration: none;
    }
    .dashboard__empty-link:hover {
      text-decoration: underline;
    }

    /* ── Bookings List ── */
    .dashboard__bookings-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .booking-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-5);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-standard);
      text-decoration: none;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .booking-item:hover {
      background: var(--hover-bg);
    }

    .booking-item__info {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .booking-item__vehicle {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .booking-item__dates {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
    }

    .booking-item__status {
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
    }

    .booking-item__amount {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    @media (max-width: 768px) {
      .dashboard__stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly bookingsService = inject(BookingsService);

  private readonly _upcomingBookings = signal<Booking[]>([]);
  private readonly _recentBookings = signal<Booking[]>([]);
  readonly upcomingBookings = this._upcomingBookings.asReadonly();
  readonly recentBookings = this._recentBookings.asReadonly();

  readonly stats = signal({
    totalBookings: 0,
    activeRentals: 0,
    totalSpent: 0
  });

  ngOnInit(): void {
    this.bookingsService.getMyBookings({ limit: 10 }).subscribe({
      next: (response) => {
        const bookings = response.data;
        this._upcomingBookings.set(this.bookingsService.upcomingBookings());
        this._recentBookings.set(bookings.slice(0, 5));

        const active = bookings.filter(b =>
          b.status === 'ACTIVE' || b.status === 'CONFIRMED'
        ).length;
        const totalSpent = bookings
          .filter(b => b.paymentStatus === 'PAID')
          .reduce((sum, b) => sum + Number(b.totalAmount), 0);

        this.stats.set({
          totalBookings: response.meta.total,
          activeRentals: active,
          totalSpent
        });
      },
      error: () => {
        // Keep empty state on error
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
