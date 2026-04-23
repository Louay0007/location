// ═══════════════════════════════════════════════════════════════════════════
// STEP EXTRAS — Booking Wizard Step 3
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingWizardState, BookingExtra } from './booking-wizard.component';

@Component({
  selector: 'app-step-extras',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-extras">
      <h2 class="step-extras__title">Options supplémentaires</h2>
      <p class="step-extras__subtitle">Personnalisez votre location avec nos options.</p>

      <div class="step-extras__list">
        @for (extra of extras(); track extra.id) {
          <div
            class="extra-option"
            [class.extra-option--selected]="extra.selected"
            (click)="toggleExtra(extra.id)"
          >
            <div class="extra-option__check">
              @if (extra.selected) {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              }
            </div>
            <div class="extra-option__info">
              <span class="extra-option__name">{{ extra.name }}</span>
            </div>
            <span class="extra-option__price">+{{ formatPrice(extra.price) }}/jour</span>
          </div>
        }
      </div>

      @if (extrasTotal() > 0) {
        <div class="step-extras__total">
          Total options: <strong>{{ formatPrice(extrasTotal()) }}</strong>
        </div>
      }

      <div class="step-extras__actions">
        <button class="step-extras__btn step-extras__btn--secondary" (click)="goBack.emit()">Retour</button>
        <button class="step-extras__btn step-extras__btn--primary" (click)="onContinue()">
          Continuer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-extras__title {
      font-family: var(--font-display);
      font-size: var(--text-tile);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tile);
      margin: 0;
    }

    .step-extras__subtitle {
      font-size: var(--text-body);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      margin-bottom: var(--space-6);
    }

    .step-extras__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
    }

    .extra-option {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      background: var(--bg-surface);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-standard);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .extra-option:hover {
      background: var(--hover-bg);
    }
    .extra-option--selected {
      border-color: var(--color-apple-blue);
      background: rgba(0, 113, 227, 0.04);
    }

    .extra-option__check {
      width: 22px;
      height: 22px;
      border-radius: var(--radius-micro);
      border: 2px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .extra-option--selected .extra-option__check {
      background: var(--color-apple-blue);
      border-color: var(--color-apple-blue);
    }
    .extra-option__check svg {
      width: 14px;
      height: 14px;
      color: #ffffff;
    }

    .extra-option__info {
      flex: 1;
    }

    .extra-option__name {
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .extra-option__price {
      font-size: var(--text-caption);
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
    }

    .step-extras__total {
      padding: var(--space-3) var(--space-4);
      background: var(--bg-secondary);
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      color: var(--text-secondary);
      margin-bottom: var(--space-6);
    }
    .step-extras__total strong {
      color: var(--text-primary);
    }

    .step-extras__actions {
      display: flex;
      justify-content: space-between;
    }

    .step-extras__btn {
      padding: 8px 15px;
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
      border: 1px solid transparent;
    }

    .step-extras__btn--primary {
      background: var(--color-apple-blue);
      color: #ffffff;
    }
    .step-extras__btn--primary:hover {
      background: var(--color-apple-blue-hover);
    }

    .step-extras__btn--secondary {
      background: var(--bg-surface);
      color: var(--text-primary);
      border-color: var(--border-color);
    }
    .step-extras__btn--secondary:hover {
      background: var(--hover-bg);
    }
  `]
})
export class StepExtrasComponent {
  @Input() wizardState!: BookingWizardState;
  @Output() extrasSelected = new EventEmitter<BookingExtra[]>();
  @Output() goBack = new EventEmitter<void>();

  private readonly _extras = signal<BookingExtra[]>([
    { id: 'insurance', name: 'Assurance tous risques', price: 30, selected: false },
    { id: 'gps', name: 'GPS de navigation', price: 10, selected: false },
    { id: 'child-seat', name: 'Siège enfant', price: 15, selected: false },
    { id: 'additional-driver', name: 'Conducteur supplémentaire', price: 20, selected: false },
    { id: 'roadside-assistance', name: 'Assistance routière 24/7', price: 12, selected: false },
  ]);
  readonly extras = this._extras.asReadonly();

  readonly extrasTotal = signal(0);

  toggleExtra(id: string): void {
    this._extras.update(list =>
      list.map(e => e.id === id ? { ...e, selected: !e.selected } : e)
    );
    this.extrasTotal.set(
      this._extras().filter(e => e.selected).reduce((sum, e) => sum + e.price, 0)
    );
  }

  onContinue(): void {
    this.extrasSelected.emit(this._extras());
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(price);
  }
}
