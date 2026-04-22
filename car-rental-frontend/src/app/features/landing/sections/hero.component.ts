// ═════════════════════════════════════════════════════════════════════════════════════════
// HERO SECTION — Apple-Style Landing Hero
// ═════════════════════════════════════════════════════════════════════════════════════════

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { Vehicle, VehicleCategory } from '../../../core/models';
import { VehicleCardComponent } from '../components/vehicle-card.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VehicleCardComponent],
  template: `
    <section class="hero">
      <div class="hero__background">
        <div class="hero__gradient"></div>
      </div>

      <div class="hero__shadow"></div>

      <div class="hero__container container">
        <div class="hero__content">
          <h1 class="hero__title">
            L'exceptionnel<br>
            <span>À portée de main.</span>
          </h1>
          <p class="hero__subtitle">
            Louez des véhicules premium avec une expérience fluide et sans compromis.
          </p>

          <div class="hero__search">
            <div class="search-form">
              <div class="search-form__field">
                <label class="search-form__label">Lieu de retrait</label>
                <div class="search-form__input-wrapper">
                  <svg class="search-form__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <select [(ngModel)]="pickupLocation" name="pickupLocation" class="search-form__input">
                    <option value="">Où allez-vous ?</option>
                    <option value="tunis">Tunis</option>
                    <option value="sfax">Sfax</option>
                    <option value="sousse">Sousse</option>
                  </select>
                </div>
              </div>

              <div class="search-form__divider"></div>

              <div class="search-form__field">
                <label class="search-form__label">Date de début</label>
                <div class="search-form__input-wrapper">
                  <svg class="search-form__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input type="date" [(ngModel)]="pickupDate" name="pickupDate" [min]="minDate" class="search-form__input">
                </div>
              </div>

              <div class="search-form__divider"></div>

              <div class="search-form__field">
                <label class="search-form__label">Date de fin</label>
                <div class="search-form__input-wrapper">
                  <svg class="search-form__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input type="date" [(ngModel)]="returnDate" name="returnDate" class="search-form__input">
                </div>
              </div>

              <button (click)="search()" class="search-form__submit" [disabled]="isSearching()">
                @if (isSearching()) {
                  <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                }
              </button>
            </div>
          </div>

          <div class="hero__stats">
            <div class="hero__stat">
              <span class="hero__stat-value">{{ fleetStats()?.vehicleCount ?? '—' }}+</span>
              <span class="hero__stat-label">Véhicules</span>
            </div>
            <div class="hero__stat-divider"></div>
            <div class="hero__stat">
              <span class="hero__stat-value">{{ fleetStats()?.clientCount ?? '—' }}+</span>
              <span class="hero__stat-label">Clients</span>
            </div>
            <div class="hero__stat-divider"></div>
            <div class="hero__stat">
              <span class="hero__stat-value">{{ fleetStats()?.bookingCount ?? '—' }}+</span>
              <span class="hero__stat-label">Réservations</span>
            </div>
          </div>
        </div>

        <!-- Featured Vehicles -->
        @if (featuredVehicles().length > 0) {
          <div class="hero__featured">
            <h3 class="hero__featured-title">Véhicules populaires</h3>
            <div class="hero__featured-grid">
              @for (vehicle of featuredVehicles(); track vehicle.id) {
                <app-vehicle-card [vehicle]="vehicle" [compact]="true"></app-vehicle-card>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: 90vh;
      display: flex;
      align-items: center;
      background: var(--bg-primary);
      padding: var(--space-20) 0;
      overflow: hidden;
      transition: background-color 0.3s ease;
    }

    .hero__background {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .hero__gradient {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 80% 20%, rgba(0, 113, 227, 0.15), transparent 40%),
        radial-gradient(circle at 20% 80%, rgba(0, 113, 227, 0.1), transparent 40%);
    }

    .hero__shadow {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 200px;
      background: linear-gradient(to bottom, transparent, var(--bg-primary));
      z-index: 1;
      pointer-events: none;
    }

    .hero__container {
      position: relative;
      z-index: 1;
      width: 100%;
    }

    .hero__content {
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }

    .hero__title {
      font-family: var(--font-display);
      font-size: clamp(3rem, 8vw, 5rem);
      font-weight: var(--weight-bold);
      line-height: 1.05;
      color: var(--text-primary);
      margin-bottom: var(--space-6);
      letter-spacing: -0.02em;
    }

    .hero__title span {
      color: var(--text-tertiary);
    }

    .hero__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-subheading);
      line-height: var(--leading-body);
      color: var(--text-secondary);
      margin-bottom: var(--space-12);
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero__search {
      margin-bottom: var(--space-16);
      padding: 0 var(--space-6);
    }

    .search-form {
      display: flex;
      align-items: center;
      background: var(--bg-elevated);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: var(--radius-pill);
      padding: var(--space-2);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-modal);
      max-width: 900px;
      margin: 0 auto;
    }

    .search-form__field {
      flex: 1;
      padding: var(--space-2) var(--space-6);
      text-align: left;
    }

    .search-form__label {
      display: block;
      font-family: var(--font-body);
      font-size: var(--text-nano);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      color: var(--text-tertiary);
      letter-spacing: 0.05em;
      margin-bottom: var(--space-1);
    }

    .search-form__input-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .search-form__icon {
      width: 16px;
      height: 16px;
      color: var(--color-apple-blue);
      flex-shrink: 0;
    }

    .search-form__input {
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: var(--text-body);
      width: 100%;
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
    }

    .search-form__input::-webkit-calendar-picker-indicator {
      display: none;
    }

    .search-form__input::-webkit-datetime-edit {
      font-family: var(--font-body);
      color: var(--text-primary);
    }

    .search-form__input option {
      background: var(--bg-elevated);
      color: var(--text-primary);
    }

    .search-form__divider {
      width: 1px;
      height: 40px;
      background: var(--border-subtle);
    }

    .search-form__submit {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-circle);
      background: var(--color-apple-blue);
      color: var(--color-white);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--duration-fast) var(--ease-default);
      flex-shrink: 0;
      border: none;
      cursor: pointer;
    }

    .search-form__submit:hover:not(:disabled) {
      background: var(--color-bright-blue);
      transform: scale(1.05);
    }

    .search-form__submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .search-form__submit svg {
      width: 24px;
      height: 24px;
    }

    .hero__stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-8);
    }

    .hero__stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero__stat-number {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .hero__stat-label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .hero__stat-divider {
      width: 1px;
      height: 40px;
      background: var(--border-subtle);
    }

    @media (max-width: 768px) {
      .hero {
        min-height: auto;
        padding: calc(var(--nav-height) + var(--space-12)) 0 var(--space-16);
      }

      .hero__title {
        font-size: clamp(2rem, 8vw, 3rem);
        margin-bottom: var(--space-4);
      }

      .hero__subtitle {
        font-size: 1rem;
        margin-bottom: var(--space-8);
      }

      .hero__search {
        padding: 0 var(--space-4);
        margin-bottom: var(--space-10);
      }

      .search-form {
        flex-direction: column;
        border-radius: var(--radius-large);
        padding: var(--space-4);
        gap: 0;
      }

      .search-form__field {
        width: 100%;
        padding: var(--space-3) var(--space-4);
      }

      .search-form__divider {
        width: 100%;
        height: 1px;
        margin: 0 var(--space-4);
      }

      .search-form__submit {
        width: 100%;
        height: 48px;
        border-radius: var(--radius-large);
        margin-top: var(--space-2);
      }

      .hero__stats {
        flex-wrap: wrap;
        gap: var(--space-6);
      }

      .hero__stat-divider {
        display: none;
      }

      .hero__stat-value {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .hero__title {
        font-size: 1.75rem;
      }

      .hero__subtitle {
        font-size: 0.9375rem;
      }

      .hero__stats {
        gap: var(--space-4);
      }
    }

    .hero__featured {
      margin-top: var(--space-16);
      width: 100%;
    }

    .hero__featured-title {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: var(--weight-semibold);
      color: var(--text-secondary);
      text-align: center;
      margin-bottom: var(--space-8);
      letter-spacing: var(--tracking-tight);
    }

    .hero__featured-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
      width: 100%;
      align-items: stretch;
    }

    @media (max-width: 1024px) {
      .hero__featured-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .hero__featured-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HeroComponent implements OnInit {
  private readonly vehiclesService = inject(VehiclesService);
  private readonly router = inject(Router);

  pickupLocation = '';
  pickupDate = '';
  returnDate = '';
  category: VehicleCategory | '' = '';

  isSearching = signal(false);

  private readonly _fleetStats = signal<{ vehicleCount: number; bookingCount: number; clientCount: number } | null>(null);
  readonly fleetStats = this._fleetStats.asReadonly();

  private readonly _featuredVehicles = signal<Vehicle[]>([]);
  readonly featuredVehicles = this._featuredVehicles.asReadonly();

  categories = this.vehiclesService.categories;
  minDate = this.getMinDate();

  ngOnInit(): void {
    // Fetch fleet stats
    this.vehiclesService.getFleetStats().subscribe({
      next: (stats) => this._fleetStats.set(stats),
      error: () => {} // Graceful fallback — stats remain null
    });

    // Fetch featured vehicles
    this.vehiclesService.getFeaturedVehicles(3).subscribe({
      next: (vehicles) => this._featuredVehicles.set(vehicles),
      error: () => {} // Graceful fallback — no featured section shown
    });

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    this.pickupDate = this.formatDate(tomorrow);
    this.returnDate = this.formatDate(nextWeek);
  }

  search(): void {
    this.isSearching.set(true);

    const params: any = {};
    if (this.pickupDate) params.startDate = this.pickupDate;
    if (this.returnDate) params.endDate = this.returnDate;
    if (this.category) params.category = this.category;
    if (this.pickupLocation) params.pickupLocation = this.pickupLocation;

    this.router.navigate(['/vehicles'], { queryParams: params });

    setTimeout(() => this.isSearching.set(false), 1000);
  }

  private getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDate(tomorrow);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}