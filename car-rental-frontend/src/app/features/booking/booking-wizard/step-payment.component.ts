// ═══════════════════════════════════════════════════════════════════════════
// STEP PAYMENT — Booking Wizard Step 4
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingWizardState } from './booking-wizard.component';

@Component({
  selector: 'app-step-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-payment">
      <h2 class="step-payment__title">Mode de paiement</h2>
      <p class="step-payment__subtitle">Choisissez votre méthode de paiement.</p>

      <div class="step-payment__methods">
        <div
          class="payment-method"
          [class.payment-method--selected]="selectedMethod() === 'PAYMEE'"
          (click)="selectedMethod.set('PAYMEE')"
        >
          <div class="payment-method__radio">
            @if (selectedMethod() === 'PAYMEE') {
              <div class="payment-method__radio-dot"></div>
            }
          </div>
          <div class="payment-method__info">
            <span class="payment-method__name">Paymee</span>
            <span class="payment-method__desc">Paiement en ligne sécurisé</span>
          </div>
          <div class="payment-method__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
        </div>

        <div
          class="payment-method"
          [class.payment-method--selected]="selectedMethod() === 'STRIPE'"
          (click)="selectedMethod.set('STRIPE')"
        >
          <div class="payment-method__radio">
            @if (selectedMethod() === 'STRIPE') {
              <div class="payment-method__radio-dot"></div>
            }
          </div>
          <div class="payment-method__info">
            <span class="payment-method__name">Carte bancaire (Stripe)</span>
            <span class="payment-method__desc">Visa, Mastercard, Amex</span>
          </div>
          <div class="payment-method__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
        </div>

        <div
          class="payment-method"
          [class.payment-method--selected]="selectedMethod() === 'CASH'"
          (click)="selectedMethod.set('CASH')"
        >
          <div class="payment-method__radio">
            @if (selectedMethod() === 'CASH') {
              <div class="payment-method__radio-dot"></div>
            }
          </div>
          <div class="payment-method__info">
            <span class="payment-method__name">Paiement sur place</span>
            <span class="payment-method__desc">Espèces à la prise en charge</span>
          </div>
          <div class="payment-method__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="step-payment__actions">
        <button class="step-payment__btn step-payment__btn--secondary" (click)="goBack.emit()">Retour</button>
        <button
          class="step-payment__btn step-payment__btn--primary"
          [disabled]="!selectedMethod()"
          (click)="onContinue()"
        >
          Continuer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-payment__title {
      font-family: var(--font-display);
      font-size: var(--text-tile);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tile);
      margin: 0;
    }

    .step-payment__subtitle {
      font-size: var(--text-body);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      margin-bottom: var(--space-6);
    }

    .step-payment__methods {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-8);
    }

    .payment-method {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-5);
      background: var(--bg-surface);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-standard);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .payment-method:hover {
      background: var(--hover-bg);
    }
    .payment-method--selected {
      border-color: var(--color-apple-blue);
      background: rgba(0, 113, 227, 0.04);
    }

    .payment-method__radio {
      width: 22px;
      height: 22px;
      border-radius: var(--radius-circle);
      border: 2px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .payment-method--selected .payment-method__radio {
      border-color: var(--color-apple-blue);
    }

    .payment-method__radio-dot {
      width: 12px;
      height: 12px;
      border-radius: var(--radius-circle);
      background: var(--color-apple-blue);
    }

    .payment-method__info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .payment-method__name {
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .payment-method__desc {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
    }

    .payment-method__icon {
      width: 32px;
      height: 32px;
      color: var(--text-tertiary);
    }
    .payment-method__icon svg {
      width: 100%;
      height: 100%;
    }

    .step-payment__actions {
      display: flex;
      justify-content: space-between;
    }

    .step-payment__btn {
      padding: 8px 15px;
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
      border: 1px solid transparent;
    }

    .step-payment__btn--primary {
      background: var(--color-apple-blue);
      color: #ffffff;
    }
    .step-payment__btn--primary:hover:not(:disabled) {
      background: var(--color-apple-blue-hover);
    }
    .step-payment__btn--primary:disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }

    .step-payment__btn--secondary {
      background: var(--bg-surface);
      color: var(--text-primary);
      border-color: var(--border-color);
    }
    .step-payment__btn--secondary:hover {
      background: var(--hover-bg);
    }
  `]
})
export class StepPaymentComponent {
  @Input() wizardState!: BookingWizardState;
  @Output() paymentSelected = new EventEmitter<'PAYMEE' | 'STRIPE' | 'CASH'>();
  @Output() goBack = new EventEmitter<void>();

  readonly selectedMethod = signal<'PAYMEE' | 'STRIPE' | 'CASH' | null>(null);

  onContinue(): void {
    const method = this.selectedMethod();
    if (method) {
      this.paymentSelected.emit(method);
    }
  }
}
