// ═══════════════════════════════════════════════════════════════════════════
// BOOKING WIZARD — Multi-Step Reservation Flow
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BookingsService } from '../../../core/services/bookings.service';
import { ToastService } from '../../../core/services/toast.service';
import { Vehicle, DateRange } from '../../../core/models';
import { StepDatesComponent } from './step-dates.component';
import { StepVehicleComponent } from './step-vehicle.component';
import { StepExtrasComponent } from './step-extras.component';
import { StepPaymentComponent } from './step-payment.component';
import { StepSummaryComponent } from './step-summary.component';

export interface BookingWizardState {
  startDate: string;
  endDate: string;
  pickupTime: string;
  returnTime: string;
  vehicleId: number | null;
  vehicle: Vehicle | null;
  extras: BookingExtra[];
  paymentMethod: 'PAYMEE' | 'STRIPE' | 'CASH' | null;
  pricing: PricingBreakdown | null;
}

export interface BookingExtra {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

export interface PricingBreakdown {
  dailyRate: number;
  durationDays: number;
  subtotal: number;
  discountAmount: number;
  depositAmount: number;
  extrasTotal: number;
  totalAmount: number;
}

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [CommonModule, RouterModule, StepDatesComponent, StepVehicleComponent, StepExtrasComponent, StepPaymentComponent, StepSummaryComponent],
  template: `
    <div class="wizard">
      <!-- Stepper -->
      <div class="wizard__stepper">
        @for (step of steps; track step.index) {
          <div
            class="wizard__step"
            [class.wizard__step--active]="currentStep() === step.index"
            [class.wizard__step--completed]="currentStep() > step.index"
          >
            <div class="wizard__step-indicator">
              @if (currentStep() > step.index) {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              } @else {
                {{ step.index + 1 }}
              }
            </div>
            <span class="wizard__step-label">{{ step.label }}</span>
          </div>
          @if (step.index < steps.length - 1) {
            <div class="wizard__step-connector" [class.wizard__step-connector--active]="currentStep() > step.index"></div>
          }
        }
      </div>

      <!-- Step Content -->
      <div class="wizard__content">
        @switch (currentStep()) {
          @case (0) {
            <app-step-dates
              [wizardState]="wizardState()"
              (datesSelected)="onDatesSelected($event)"
            />
          }
          @case (1) {
            <app-step-vehicle
              [wizardState]="wizardState()"
              (vehicleSelected)="onVehicleSelected($event)"
              (goBack)="goBack()"
            />
          }
          @case (2) {
            <app-step-extras
              [wizardState]="wizardState()"
              (extrasSelected)="onExtrasSelected($event)"
              (goBack)="goBack()"
            />
          }
          @case (3) {
            <app-step-payment
              [wizardState]="wizardState()"
              (paymentSelected)="onPaymentSelected($event)"
              (goBack)="goBack()"
            />
          }
          @case (4) {
            <app-step-summary
              [wizardState]="wizardState()"
              (confirm)="onConfirm()"
              (goBack)="goBack()"
              [isSubmitting]="isSubmitting()"
            />
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .wizard {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--space-8) var(--space-6);
    }

    /* ── Stepper ── */
    .wizard__stepper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: var(--space-10);
      padding: 0 var(--space-4);
    }

    .wizard__step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }

    .wizard__step-indicator {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-circle);
      border: 2px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: var(--text-tertiary);
      transition: all var(--duration-normal) var(--ease-default);
    }
    .wizard__step-indicator svg {
      width: 18px;
      height: 18px;
    }

    .wizard__step--active .wizard__step-indicator {
      border-color: var(--color-apple-blue);
      background: var(--color-apple-blue);
      color: #ffffff;
    }

    .wizard__step--completed .wizard__step-indicator {
      border-color: var(--color-success);
      background: var(--color-success);
      color: #ffffff;
    }

    .wizard__step-label {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
      white-space: nowrap;
    }
    .wizard__step--active .wizard__step-label {
      color: var(--color-apple-blue);
      font-weight: var(--weight-semibold);
    }
    .wizard__step--completed .wizard__step-label {
      color: var(--color-success);
    }

    .wizard__step-connector {
      flex: 1;
      height: 2px;
      background: var(--border-color);
      margin: 0 var(--space-2);
      margin-bottom: var(--space-5);
      transition: background var(--duration-normal) var(--ease-default);
    }
    .wizard__step-connector--active {
      background: var(--color-success);
    }

    .wizard__content {
      min-height: 400px;
    }

    @media (max-width: 640px) {
      .wizard__step-label {
        display: none;
      }
      .wizard__stepper {
        margin-bottom: var(--space-6);
      }
    }
  `]
})
export class BookingWizardComponent {
  private readonly bookingsService = inject(BookingsService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly currentStep = signal(0);
  readonly isSubmitting = signal(false);

  readonly steps = [
    { index: 0, label: 'Dates' },
    { index: 1, label: 'Véhicule' },
    { index: 2, label: 'Options' },
    { index: 3, label: 'Paiement' },
    { index: 4, label: 'Résumé' }
  ];

  readonly wizardState = signal<BookingWizardState>({
    startDate: '',
    endDate: '',
    pickupTime: '09:00',
    returnTime: '09:00',
    vehicleId: null,
    vehicle: null,
    extras: [],
    paymentMethod: null,
    pricing: null
  });

  onDatesSelected(dates: Partial<BookingWizardState>): void {
    this.wizardState.update(state => ({ ...state, ...dates }));
    this.currentStep.set(1);
  }

  onVehicleSelected(data: { vehicle: Vehicle; pricing: PricingBreakdown }): void {
    this.wizardState.update(state => ({
      ...state,
      vehicleId: data.vehicle.id,
      vehicle: data.vehicle,
      pricing: data.pricing
    }));
    this.currentStep.set(2);
  }

  onExtrasSelected(extras: BookingExtra[]): void {
    const extrasTotal = extras.filter(e => e.selected).reduce((sum, e) => sum + e.price, 0);
    this.wizardState.update(state => {
      const pricing = state.pricing!;
      return {
        ...state,
        extras,
        pricing: {
          ...pricing,
          extrasTotal,
          totalAmount: pricing.subtotal - pricing.discountAmount + pricing.depositAmount + extrasTotal
        }
      };
    });
    this.currentStep.set(3);
  }

  onPaymentSelected(method: 'PAYMEE' | 'STRIPE' | 'CASH'): void {
    this.wizardState.update(state => ({ ...state, paymentMethod: method }));
    this.currentStep.set(4);
  }

  onConfirm(): void {
    const state = this.wizardState();
    if (!state.vehicleId || !state.startDate || !state.endDate) return;

    this.isSubmitting.set(true);

    this.bookingsService.createBooking({
      vehicleId: state.vehicleId,
      startDate: state.startDate,
      endDate: state.endDate,
      pickupTime: state.pickupTime,
      returnTime: state.returnTime,
      notes: state.extras.filter(e => e.selected).map(e => e.name).join(', ') || undefined
    }).subscribe({
      next: (booking) => {
        this.isSubmitting.set(false);
        this.toastService.success('Réservation créée avec succès !');
        this.router.navigate(['/booking/confirmation', booking.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.error(err.error?.message || 'Erreur lors de la création de la réservation.');
      }
    });
  }

  goBack(): void {
    this.currentStep.update(step => Math.max(0, step - 1));
  }
}
