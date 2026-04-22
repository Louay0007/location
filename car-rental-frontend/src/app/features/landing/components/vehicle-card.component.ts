// ═════════════════════════════════════════════════════════════════════════════════════════
// VEHICLE CARD COMPONENT — Apple-Style Product Card
// ═════════════════════════════════════════════════════════════════════════════════════════

import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Vehicle } from '../../../core/models';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article class="vehicle-card" [class.vehicle-card--compact]="compact">
      <a [routerLink]="['/vehicles', vehicle.id]" class="vehicle-card__link">
        <!-- Image -->
        <div class="vehicle-card__image-wrapper">
          @if (vehicle.mainImageUrl || (vehicle.images && vehicle.images.length > 0)) {
            <img 
              [src]="vehicle.mainImageUrl || vehicle.images![0].imageUrl"
              [alt]="vehicle.brand + ' ' + vehicle.model"
              class="vehicle-card__image"
              loading="lazy">
          } @else {
            <div class="vehicle-card__image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM5 17l-1-8h16l-1 8"/>
              </svg>
            </div>
          }
          @if (vehicle.averageRating) {
            <div class="vehicle-card__rating">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {{ vehicle.averageRating.toFixed(1) }}
            </div>
          }
        </div>

        <!-- Content -->
        <div class="vehicle-card__content">
          <h3 class="vehicle-card__title">
            {{ vehicle.brand }} {{ vehicle.model }}
          </h3>
          
          @if (!compact) {
            <p class="vehicle-card__subtitle">
              {{ vehicle.year }} · {{ categoryLabel() }}
            </p>
          }

          <!-- Specs -->
          <div class="vehicle-card__specs">
            <span class="vehicle-card__spec">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              {{ vehicle.seats }}
            </span>
            <span class="vehicle-card__spec">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              {{ vehicle.transmission === 'AUTOMATIC' ? 'Auto' : 'Manuelle' }}
            </span>
            <span class="vehicle-card__spec">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 11l19-9-9 19-2-8-8-2z"/>
              </svg>
              {{ fuelLabel() }}
            </span>
          </div>

          <!-- Features -->
          @if (!compact && vehicle.features && vehicle.features.length > 0) {
            <div class="vehicle-card__features">
              @for (feature of vehicle.features.slice(0, 3); track feature) {
                <span class="vehicle-card__feature">{{ feature }}</span>
              }
              @if (vehicle.features.length > 3) {
                <span class="vehicle-card__feature vehicle-card__feature--more">
                  +{{ vehicle.features.length - 3 }}
                </span>
              }
            </div>
          }

          <!-- Price -->
          <div class="vehicle-card__footer">
            <div class="vehicle-card__price">
              <span class="vehicle-card__price-amount">{{ vehicle.dailyRate | number:'1.0-0' }}</span>
              <span class="vehicle-card__price-unit">TND/jour</span>
            </div>
            <span class="vehicle-card__cta">
              Voir
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </div>
      </a>
    </article>
  `,
  styles: [`
    .vehicle-card {
      background: var(--color-light-gray);
      border-radius: var(--radius-large);
      overflow: hidden;
      transition: transform var(--duration-normal) var(--ease-default),
                  box-shadow var(--duration-normal) var(--ease-default);
      min-height: 420px;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .vehicle-card:hover {
      transform: scale(1.02);
      box-shadow: var(--shadow-card);
    }

    .vehicle-card__link {
      display: flex;
      flex-direction: column;
      height: 100%;
      text-decoration: none;
      color: inherit;
    }

    .vehicle-card__image-wrapper {
      position: relative;
      aspect-ratio: 16 / 10;
      background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
    }

    .vehicle-card__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .vehicle-card__image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 100%);
    }

    .vehicle-card__image-placeholder svg {
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .vehicle-card__rating {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-2);
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      border-radius: var(--radius-micro);
      font-size: 0.75rem;
      font-weight: var(--weight-semibold);
      color: var(--color-white);
    }

    .vehicle-card__rating svg {
      width: 12px;
      height: 12px;
      color: #ffb400;
    }

    .vehicle-card__content {
      padding: var(--space-5);
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .vehicle-card__title {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: var(--weight-semibold);
      line-height: 1.2;
      color: var(--color-near-black);
      margin: 0 0 var(--space-1);
    }

    .vehicle-card__subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin: 0 0 var(--space-3);
    }

    .vehicle-card__specs {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-3);
    }

    .vehicle-card__spec {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .vehicle-card__spec svg {
      width: 14px;
      height: 14px;
      opacity: 0.6;
    }

    .vehicle-card__features {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .vehicle-card__feature {
      padding: var(--space-1) var(--space-2);
      background: rgba(0, 0, 0, 0.05);
      border-radius: var(--radius-micro);
      font-size: 0.6875rem;
      color: var(--color-text-secondary);
    }

    .vehicle-card__feature--more {
      background: transparent;
      color: var(--color-apple-blue);
    }

    .vehicle-card__footer {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-4);
      width: 100%;
      flex-wrap: nowrap;
      padding-top: var(--space-4);
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      margin-top: auto;
      min-height: 44px;
    }

    .vehicle-card__price {
      display: flex;
      align-items: baseline;
      gap: var(--space-1);
      min-width: 120px;
    }

    .vehicle-card__price-amount {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: var(--weight-semibold);
      color: var(--color-near-black);
      font-variant-numeric: tabular-nums;
    }

    .vehicle-card__price-unit {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .vehicle-card__cta {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: 0.875rem;
      font-weight: var(--weight-medium);
      color: var(--color-apple-blue);
      transition: gap var(--duration-fast) var(--ease-default);
    }

    .vehicle-card:hover .vehicle-card__cta {
      gap: var(--space-2);
    }

    .vehicle-card__cta svg {
      width: 16px;
      height: 16px;
    }

    /* Compact variant */
    .vehicle-card--compact .vehicle-card__image-wrapper {
      aspect-ratio: 16 / 9;
    }

    .vehicle-card--compact .vehicle-card__title {
      font-size: 1rem;
    }

    .vehicle-card--compact .vehicle-card__content {
      padding: var(--space-4);
    }

    .vehicle-card--compact .vehicle-card__specs {
      gap: var(--space-3);
    }

    .vehicle-card--compact .vehicle-card__footer {
      padding-top: var(--space-3);
      margin-top: auto;
    }
  `]
})
export class VehicleCardComponent {
  @Input({ required: true }) vehicle!: Vehicle;
  @Input() compact = false;

  categoryLabel = computed(() => {
    const labels: Record<string, string> = {
      'ECONOMY': 'Économique',
      'COMPACT': 'Compacte',
      'SEDAN': 'Berline',
      'SUV': 'SUV',
      'LUXURY': 'Luxe',
      'VAN': 'Van'
    };
    return labels[this.vehicle.category] || this.vehicle.category;
  });

  fuelLabel = computed(() => {
    const labels: Record<string, string> = {
      'ESSENCE': 'Essence',
      'DIESEL': 'Diesel',
      'HYBRID': 'Hybride',
      'ELECTRIC': 'Électrique'
    };
    return labels[this.vehicle.fuelType] || this.vehicle.fuelType;
  });
}