// ═══════════════════════════════════════════════════════════════════════════
// STEP SUMMARY — Booking Wizard Step 5
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingWizardState } from './booking-wizard.component';

@Component({
  selector: 'app-step-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-summary">
      <h2 class="step-summary__title">Récapitulatif</h2>
      <p class="step-summary__subtitle">Vérifiez les détails de votre réservation.</p>

      <!-- Vehicle -->
      <div class="step-summary__card">
        <h3 class="step-summary__card-title">Véhicule</h3>
        <div class="step-summary__vehicle">
          @if (wizardState.vehicle?.mainImageUrl) {
            <img [src]="wizardState.vehicle!.mainImageUrl" [alt]="wizardState.vehicle?.brand" class="step-summary__vehicle-img" />
          }
          <div class="step-summary__vehicle-info">
            <span class="step-summary__vehicle-name">{{ wizardState.vehicle?.brand }} {{ wizardState.vehicle?.model }}</span>
            <span class="step-summary__vehicle-year">{{ wizardState.vehicle?.year }} · {{ wizardState.vehicle?.fuelType }}</span>
          </div>
        </div>
      </div>

      <!-- Dates -->
      <div class="step-summary__card">
        <h3 class="step-summary__card-title">Dates</h3>
        <div class="step-summary__row">
          <span class="step-summary__label">Début</span>
          <span class="step-summary__value">{{ formatDate(wizardState.startDate) }} à {{ wizardState.pickupTime }}</span>
        </div>
        <div class="step-summary__row">
          <span class="step-summary__label">Fin</span>
          <span class="step-summary__value">{{ formatDate(wizardState.endDate) }} à {{ wizardState.returnTime }}</span>
        </div>
        <div class="step-summary__row">
          <span class="step-summary__label">Durée</span>
          <span class="step-summary__value">{{ wizardState.pricing?.durationDays }} jour{{ (wizardState.pricing?.durationDays ?? 0) > 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Extras -->
      @if (wizardState.extras.length > 0) {
        <div class="step-summary__card">
          <h3 class="step-summary__card-title">Options</h3>
          @for (extra of wizardState.extras; track extra.id) {
            @if (extra.selected) {
              <div class="step-summary__row">
                <span class="step-summary__label">{{ extra.name }}</span>
                <span class="step-summary__value">{{ formatPrice(extra.price) }}/jour</span>
              </div>
            }
          }
        </div>
      }

      <!-- Payment -->
      <div class="step-summary__card">
        <h3 class="step-summary__card-title">Paiement</h3>
        <div class="step-summary__row">
          <span class="step-summary__label">Méthode</span>
          <span class="step-summary__value">{{ getPaymentLabel() }}</span>
        </div>
      </div>

      <!-- Price Breakdown -->
      <div class="step-summary__card step-summary__card--pricing">
        <h3 class="step-summary__card-title">Détail du prix</h3>
        <div class="step-summary__row">
          <span class="step-summary__label">Tarif/jour</span>
          <span class="step-summary__value">{{ formatPrice(wizardState.pricing?.dailyRate ?? 0) }}</span>
        </div>
        <div class="step-summary__row">
          <span class="step-summary__label">Sous-total</span>
          <span class="step-summary__value">{{ formatPrice(wizardState.pricing?.subtotal ?? 0) }}</span>
        </div>
        @if ((wizardState.pricing?.discountAmount ?? 0) > 0) {
          <div class="step-summary__row step-summary__row--discount">
            <span class="step-summary__label">Remise</span>
            <span class="step-summary__value">-{{ formatPrice(wizardState.pricing?.discountAmount ?? 0) }}</span>
          </div>
        }
        <div class="step-summary__row">
          <span class="step-summary__label">Caution</span>
          <span class="step-summary__value">{{ formatPrice(wizardState.pricing?.depositAmount ?? 0) }}</span>
        </div>
        @if ((wizardState.pricing?.extrasTotal ?? 0) > 0) {
          <div class="step-summary__row">
            <span class="step-summary__label">Options</span>
            <span class="step-summary__value">{{ formatPrice(wizardState.pricing?.extrasTotal ?? 0) }}</span>
          </div>
        }
        <div class="step-summary__row step-summary__row--total">
          <span class="step-summary__label">Total</span>
          <span class="step-summary__value">{{ formatPrice(wizardState.pricing?.totalAmount ?? 0) }}</span>
        </div>
      </div>

      <div class="step-summary__actions">
        <button class="step-summary__btn step-summary__btn--secondary" (click)="goBack.emit()">Retour</button>
        <button
          class="step-summary__btn step-summary__btn--primary"
          [disabled]="isSubmitting"
          (click)="confirm.emit()"
        >
          @if (isSubmitting) {
            <svg class="step-summary__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
            </svg>
          }
          Confirmer la réservation
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-summary__title {
      font-family: var(--font-display);
      font-size: var(--text-tile);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tile);
      margin: 0;
    }

    .step-summary__subtitle {
      font-size: var(--text-body);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      margin-bottom: var(--space-6);
    }

    .step-summary__card {
      padding: var(--space-5);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-standard);
      margin-bottom: var(--space-3);
    }

    .step-summary__card--pricing {
      border-color: var(--color-apple-blue);
      background: rgba(0, 113, 227, 0.02);
    }

    .step-summary__card-title {
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      color: var(--text-tertiary);
      letter-spacing: var(--tracking-micro);
      text-transform: uppercase;
      margin: 0 0 var(--space-3) 0;
    }

    /* ── Vehicle ── */
    .step-summary__vehicle {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .step-summary__vehicle-img {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: var(--radius-micro);
    }

    .step-summary__vehicle-info {
      display: flex;
      flex-direction: column;
    }

    .step-summary__vehicle-name {
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .step-summary__vehicle-year {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
    }

    /* ── Rows ── */
    .step-summary__row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-1) 0;
      font-size: var(--text-caption);
    }

    .step-summary__label {
      color: var(--text-secondary);
    }

    .step-summary__value {
      color: var(--text-primary);
      font-weight: var(--weight-semibold);
      font-variant-numeric: tabular-nums;
    }

    .step-summary__row--discount .step-summary__value {
      color: var(--color-success);
    }

    .step-summary__row--total {
      margin-top: var(--space-2);
      padding-top: var(--space-2);
      border-top: 1px solid var(--border-color);
      font-size: var(--text-body);
    }
    .step-summary__row--total .step-summary__label {
      color: var(--text-primary);
      font-weight: var(--weight-semibold);
    }
    .step-summary__row--total .step-summary__value {
      font-size: var(--text-subheading);
    }

    /* ── Actions ── */
    .step-summary__actions {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-6);
    }

    .step-summary__btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 8px 15px;
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
      border: 1px solid transparent;
    }

    .step-summary__btn--primary {
      background: var(--color-apple-blue);
      color: #ffffff;
    }
    .step-summary__btn--primary:hover:not(:disabled) {
      background: var(--color-apple-blue-hover);
    }
    .step-summary__btn--primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .step-summary__btn--secondary {
      background: var(--bg-surface);
      color: var(--text-primary);
      border-color: var(--border-color);
    }
    .step-summary__btn--secondary:hover {
      background: var(--hover-bg);
    }

    .step-summary__spinner {
      width: 16px;
      height: 16px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class StepSummaryComponent {
  @Input() wizardState!: BookingWizardState;
  @Input() isSubmitting = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatPrice(price: number | undefined): string {
    const num = price ?? 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(num);
  }

  getPaymentLabel(): string {
    const labels: Record<string, string> = {
      'PAYMEE': 'Paymee',
      'STRIPE': 'Carte bancaire',
      'CASH': 'Espèces sur place'
    };
    return labels[this.wizardState.paymentMethod || ''] || '';
  }
}
