// ═══════════════════════════════════════════════════════════════════════════
// STEP DATES — Booking Wizard Step 1
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingWizardState } from './booking-wizard.component';

@Component({
  selector: 'app-step-dates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-dates">
      <h2 class="step-dates__title">Choisissez vos dates</h2>
      <p class="step-dates__subtitle">Sélectionnez la période de location.</p>

      <form class="step-dates__form" (ngSubmit)="onSubmit()" #form="ngForm">
        <div class="step-dates__grid">
          <div class="step-dates__field">
            <label class="step-dates__label" for="startDate">Date de début</label>
            <input
              id="startDate"
              type="date"
              class="step-dates__input"
              [(ngModel)]="startDate"
              name="startDate"
              required
              [min]="minDate"
              (change)="onDateChange()"
            />
          </div>
          <div class="step-dates__field">
            <label class="step-dates__label" for="endDate">Date de fin</label>
            <input
              id="endDate"
              type="date"
              class="step-dates__input"
              [(ngModel)]="endDate"
              name="endDate"
              required
              [min]="startDate || minDate"
              (change)="onDateChange()"
            />
          </div>
        </div>

        <div class="step-dates__grid">
          <div class="step-dates__field">
            <label class="step-dates__label" for="pickupTime">Heure de prise en charge</label>
            <input
              id="pickupTime"
              type="time"
              class="step-dates__input"
              [(ngModel)]="pickupTime"
              name="pickupTime"
            />
          </div>
          <div class="step-dates__field">
            <label class="step-dates__label" for="returnTime">Heure de retour</label>
            <input
              id="returnTime"
              type="time"
              class="step-dates__input"
              [(ngModel)]="returnTime"
              name="returnTime"
            />
          </div>
        </div>

        @if (durationDays() > 0) {
          <div class="step-dates__duration">
            Durée de location: <strong>{{ durationDays() }} jour{{ durationDays() > 1 ? 's' : '' }}</strong>
          </div>
        }

        @if (error()) {
          <div class="step-dates__error">{{ error() }}</div>
        }

        <div class="step-dates__actions">
          <button
            type="submit"
            class="step-dates__btn step-dates__btn--primary"
            [disabled]="!startDate || !endDate || durationDays() < 1"
          >
            Continuer
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .step-dates__title {
      font-family: var(--font-display);
      font-size: var(--text-tile);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tile);
      margin: 0;
    }

    .step-dates__subtitle {
      font-size: var(--text-body);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      margin-bottom: var(--space-6);
    }

    .step-dates__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .step-dates__grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
    }

    @media (max-width: 640px) {
      .step-dates__grid {
        grid-template-columns: 1fr;
      }
    }

    .step-dates__field {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .step-dates__label {
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      color: var(--text-secondary);
      letter-spacing: var(--tracking-micro);
    }

    .step-dates__input {
      padding: 10px 14px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-comfortable);
      background: var(--bg-secondary);
      font-family: var(--font-body);
      font-size: var(--text-body);
      color: var(--text-primary);
      outline: none;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .step-dates__input:focus {
      border-color: var(--color-apple-blue);
      box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
    }

    .step-dates__duration {
      padding: var(--space-3) var(--space-4);
      background: var(--bg-secondary);
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      color: var(--text-secondary);
    }
    .step-dates__duration strong {
      color: var(--text-primary);
    }

    .step-dates__error {
      padding: var(--space-3) var(--space-4);
      background: rgba(255, 59, 48, 0.1);
      color: var(--color-error);
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
    }

    .step-dates__actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-4);
    }

    .step-dates__btn {
      padding: 8px 15px;
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
      border: 1px solid transparent;
    }

    .step-dates__btn--primary {
      background: var(--color-apple-blue);
      color: #ffffff;
    }
    .step-dates__btn--primary:hover:not(:disabled) {
      background: var(--color-apple-blue-hover);
    }
    .step-dates__btn--primary:disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }
  `]
})
export class StepDatesComponent {
  @Input() wizardState!: BookingWizardState;
  @Output() datesSelected = new EventEmitter<Partial<BookingWizardState>>();

  startDate = '';
  endDate = '';
  pickupTime = '09:00';
  returnTime = '09:00';

  readonly error = signal('');
  readonly durationDays = signal(0);

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  onDateChange(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      this.durationDays.set(diff);

      if (diff < 1) {
        this.error.set('La date de fin doit être après la date de début.');
      } else {
        this.error.set('');
      }
    } else {
      this.durationDays.set(0);
    }
  }

  onSubmit(): void {
    if (this.durationDays() < 1) return;

    this.datesSelected.emit({
      startDate: this.startDate,
      endDate: this.endDate,
      pickupTime: this.pickupTime,
      returnTime: this.returnTime
    });
  }
}
