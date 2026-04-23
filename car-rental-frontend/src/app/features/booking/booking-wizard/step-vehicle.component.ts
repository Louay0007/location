// ═══════════════════════════════════════════════════════════════════════════
// STEP VEHICLE — Booking Wizard Step 2
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { BookingsService } from '../../../core/services/bookings.service';
import { Vehicle } from '../../../core/models';
import { BookingWizardState, PricingBreakdown } from './booking-wizard.component';

@Component({
  selector: 'app-step-vehicle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="step-vehicle">
      <h2 class="step-vehicle__title">Choisissez votre véhicule</h2>
      <p class="step-vehicle__subtitle">Sélectionnez le véhicule qui vous convient.</p>

      @if (isLoading()) {
        <div class="step-vehicle__loading">
          <div class="step-vehicle__skeleton"></div>
          <div class="step-vehicle__skeleton"></div>
          <div class="step-vehicle__skeleton"></div>
        </div>
      } @else if (vehicles().length === 0) {
        <div class="step-vehicle__empty">
          <p>Aucun véhicule disponible pour ces dates.</p>
        </div>
      } @else {
        <div class="step-vehicle__grid">
          @for (vehicle of vehicles(); track vehicle.id) {
            <div
              class="vehicle-option"
              [class.vehicle-option--selected]="selectedVehicleId() === vehicle.id"
              (click)="selectVehicle(vehicle)"
            >
              <div class="vehicle-option__image">
                @if (vehicle.mainImageUrl) {
                  <img [src]="vehicle.mainImageUrl" [alt]="vehicle.brand" />
                } @else {
                  <div class="vehicle-option__placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                }
              </div>
              <div class="vehicle-option__info">
                <span class="vehicle-option__name">{{ vehicle.brand }} {{ vehicle.model }}</span>
                <span class="vehicle-option__specs">{{ vehicle.year }} · {{ vehicle.fuelType }} · {{ vehicle.transmission === 'AUTOMATIC' ? 'Auto' : 'Manuelle' }}</span>
                <span class="vehicle-option__seats">{{ vehicle.seats }} places</span>
              </div>
              <div class="vehicle-option__price">
                <span class="vehicle-option__daily">{{ formatPrice(vehicle.dailyRate) }}</span>
                <span class="vehicle-option__per-day">/jour</span>
              </div>
              @if (selectedVehicleId() === vehicle.id) {
                <div class="vehicle-option__check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              }
            </div>
          }
        </div>
      }

      <div class="step-vehicle__actions">
        <button class="step-vehicle__btn step-vehicle__btn--secondary" (click)="goBack.emit()">Retour</button>
        <button
          class="step-vehicle__btn step-vehicle__btn--primary"
          [disabled]="!selectedVehicleId()"
          (click)="onContinue()"
        >
          Continuer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-vehicle__title {
      font-family: var(--font-display);
      font-size: var(--text-tile);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tile);
      margin: 0;
    }

    .step-vehicle__subtitle {
      font-size: var(--text-body);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      margin-bottom: var(--space-6);
    }

    .step-vehicle__loading {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .step-vehicle__skeleton {
      height: 80px;
      border-radius: var(--radius-standard);
      background: var(--bg-secondary);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .step-vehicle__empty {
      padding: var(--space-10);
      text-align: center;
      color: var(--text-tertiary);
    }

    /* ── Vehicle Options ── */
    .step-vehicle__grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .vehicle-option {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-5);
      background: var(--bg-surface);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-standard);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
      position: relative;
    }
    .vehicle-option:hover {
      background: var(--hover-bg);
    }
    .vehicle-option--selected {
      border-color: var(--color-apple-blue);
      background: rgba(0, 113, 227, 0.04);
    }

    .vehicle-option__image {
      width: 80px;
      height: 56px;
      border-radius: var(--radius-micro);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--bg-secondary);
    }
    .vehicle-option__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .vehicle-option__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
    }
    .vehicle-option__placeholder svg {
      width: 28px;
      height: 28px;
    }

    .vehicle-option__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .vehicle-option__name {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .vehicle-option__specs,
    .vehicle-option__seats {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
    }

    .vehicle-option__price {
      text-align: right;
      flex-shrink: 0;
    }

    .vehicle-option__daily {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    .vehicle-option__per-day {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
    }

    .vehicle-option__check {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      width: 24px;
      height: 24px;
      border-radius: var(--radius-circle);
      background: var(--color-apple-blue);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .vehicle-option__check svg {
      width: 14px;
      height: 14px;
      color: #ffffff;
    }

    /* ── Actions ── */
    .step-vehicle__actions {
      display: flex;
      justify-content: space-between;
    }

    .step-vehicle__btn {
      padding: 8px 15px;
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
      border: 1px solid transparent;
    }

    .step-vehicle__btn--primary {
      background: var(--color-apple-blue);
      color: #ffffff;
    }
    .step-vehicle__btn--primary:hover:not(:disabled) {
      background: var(--color-apple-blue-hover);
    }
    .step-vehicle__btn--primary:disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }

    .step-vehicle__btn--secondary {
      background: var(--bg-surface);
      color: var(--text-primary);
      border-color: var(--border-color);
    }
    .step-vehicle__btn--secondary:hover {
      background: var(--hover-bg);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class StepVehicleComponent implements OnInit {
  @Input() wizardState!: BookingWizardState;
  @Output() vehicleSelected = new EventEmitter<{ vehicle: Vehicle; pricing: PricingBreakdown }>();
  @Output() goBack = new EventEmitter<void>();

  private readonly vehiclesService = inject(VehiclesService);
  private readonly bookingsService = inject(BookingsService);

  private readonly _vehicles = signal<Vehicle[]>([]);
  readonly vehicles = this._vehicles.asReadonly();

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  readonly selectedVehicleId = signal<number | null>(null);
  private selectedVehicle: Vehicle | null = null;

  ngOnInit(): void {
    this._isLoading.set(true);
    this.vehiclesService.getVehicles({ status: 'AVAILABLE' }).subscribe({
      next: (vehicles) => {
        this._vehicles.set(vehicles);
        this._isLoading.set(false);
      },
      error: () => {
        this._isLoading.set(false);
      }
    });
  }

  selectVehicle(vehicle: Vehicle): void {
    this.selectedVehicleId.set(vehicle.id);
    this.selectedVehicle = vehicle;
  }

  onContinue(): void {
    if (!this.selectedVehicle) return;

    this.bookingsService.calculatePrice(this.selectedVehicle.id, {
      startDate: this.wizardState.startDate,
      endDate: this.wizardState.endDate
    }).subscribe({
      next: (pricing) => {
        this.vehicleSelected.emit({
          vehicle: this.selectedVehicle!,
          pricing: {
            dailyRate: pricing.dailyRate,
            durationDays: pricing.durationDays,
            subtotal: pricing.subtotal,
            discountAmount: pricing.discountAmount,
            depositAmount: pricing.depositAmount,
            extrasTotal: 0,
            totalAmount: pricing.totalAmount
          }
        });
      }
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
