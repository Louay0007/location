// ═══════════════════════════════════════════════════════════════════════════
// DATE PICKER COMPONENT — Single/Range Date Selection
// ═══════════════════════════════════════════════════════════════════════════

import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DatePickerMode = 'single' | 'range';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="datepicker">
      <div class="datepicker__header">
        <button class="datepicker__nav" (click)="previousMonth()" aria-label="Mois précédent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span class="datepicker__title">{{ monthName() }} {{ year() }}</span>
        <button class="datepicker__nav" (click)="nextMonth()" aria-label="Mois suivant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div class="datepicker__weekdays">
        @for (day of ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']; track day) {
          <span class="datepicker__weekday">{{ day }}</span>
        }
      </div>

      <div class="datepicker__days">
        @for (date of calendarDays(); track date.day) {
          <button
            class="datepicker__day"
            [class.datepicker__day--disabled]="date.disabled"
            [class.datepicker__day--selected]="date.selected"
            [class.datepicker__day--range-start]="date.rangeStart"
            [class.datepicker__day--range-end]="date.rangeEnd"
            [class.datepicker__day--in-range]="date.inRange"
            [disabled]="date.disabled"
            (click)="selectDate(date)"
            [attr.aria-label]="date.day + ' ' + monthName() + ' ' + year()">
            {{ date.day }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .datepicker {
      background: var(--bg-elevated);
      border-radius: var(--radius-large);
      padding: var(--space-4);
      border: 1px solid var(--border-subtle);
      min-width: 320px;
    }

    .datepicker__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }

    .datepicker__nav {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      border-radius: var(--radius-standard);
      color: var(--text-primary);
      cursor: pointer;
      transition: background var(--duration-fast) var(--ease-default);
    }

    .datepicker__nav:hover {
      background: var(--hover-bg);
    }

    .datepicker__nav svg {
      width: 16px;
      height: 16px;
    }

    .datepicker__title {
      font-family: var(--font-display);
      font-size: var(--text-body);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .datepicker__weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--space-1);
      margin-bottom: var(--space-2);
    }

    .datepicker__weekday {
      text-align: center;
      font-size: var(--text-nano);
      font-weight: var(--weight-medium);
      color: var(--text-tertiary);
      text-transform: uppercase;
    }

    .datepicker__days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--space-1);
    }

    .datepicker__day {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      font-weight: var(--weight-medium);
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }

    .datepicker__day:hover:not(:disabled) {
      background: var(--hover-bg);
    }

    .datepicker__day--disabled {
      opacity: 0.32;
      cursor: not-allowed;
    }

    .datepicker__day--selected {
      background: var(--color-apple-blue);
      color: #ffffff;
    }

    .datepicker__day--selected:hover {
      background: var(--color-apple-blue-hover);
    }

    .datepicker__day--range-start,
    .datepicker__day--range-end {
      background: var(--color-apple-blue);
      color: #ffffff;
    }

    .datepicker__day--in-range {
      background: rgba(0, 122, 255, 0.1);
    }

    :host-context([data-theme="light"]) .datepicker__day--in-range {
      background: rgba(0, 122, 255, 0.15);
    }
  `]
})
export class DatepickerComponent {
  readonly mode = input<DatePickerMode>('single');
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly disabledDates = input<Date[]>([]);
  readonly valueChange = output<Date | Date[]>();

  private readonly _currentMonth = signal(new Date());
  private readonly _selectedDate = signal<Date | null>(null);
  private readonly _selectedRange = signal<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  readonly currentMonth = this._currentMonth.asReadonly();

  readonly year = computed(() => this._currentMonth().getFullYear());
  readonly month = computed(() => this._currentMonth().getMonth());

  readonly monthName = computed(() => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[this.month()];
  });

  readonly calendarDays = computed(() => {
    const year = this.year();
    const month = this.month();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7; // Adjust for Monday start

    const days: CalendarDay[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push({ day: 0, disabled: true, selected: false, rangeStart: false, rangeEnd: false, inRange: false });
    }

    // Days of the month
    const today = new Date();
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const disabled = this.isDateDisabled(date);
      const selected = this.isDateSelected(date);
      const { rangeStart, rangeEnd, inRange } = this.getRangeStatus(date);

      days.push({ day, disabled, selected, rangeStart, rangeEnd, inRange });
    }

    return days;
  });

  previousMonth(): void {
    const newDate = new Date(this._currentMonth());
    newDate.setMonth(newDate.getMonth() - 1);
    this._currentMonth.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this._currentMonth());
    newDate.setMonth(newDate.getMonth() + 1);
    this._currentMonth.set(newDate);
  }

  selectDate(date: CalendarDay): void {
    if (date.disabled || date.day === 0) return;

    const selectedDate = new Date(this.year(), this.month(), date.day);

    if (this.mode() === 'single') {
      this._selectedDate.set(selectedDate);
      this.valueChange.emit(selectedDate);
    } else {
      const range = this._selectedRange();
      if (!range.start || (range.start && range.end)) {
        this._selectedRange.set({ start: selectedDate, end: null });
      } else {
        const start = range.start < selectedDate ? range.start : selectedDate;
        const end = range.start < selectedDate ? selectedDate : range.start;
        this._selectedRange.set({ start, end });
        this.valueChange.emit([start, end]);
      }
    }
  }

  private isDateDisabled(date: Date): boolean {
    if (this.minDate() && date < this.minDate()!) return true;
    if (this.maxDate() && date > this.maxDate()!) return true;
    if (this.disabledDates().some(d => d.toDateString() === date.toDateString())) return true;
    return false;
  }

  private isDateSelected(date: Date): boolean {
    if (this.mode() === 'single') {
      return this._selectedDate()?.toDateString() === date.toDateString();
    }
    return false;
  }

  private getRangeStatus(date: Date): { rangeStart: boolean; rangeEnd: boolean; inRange: boolean } {
    if (this.mode() !== 'range') return { rangeStart: false, rangeEnd: false, inRange: false };

    const range = this._selectedRange();
    if (!range.start) return { rangeStart: false, rangeEnd: false, inRange: false };

    const rangeStart = range.start.toDateString() === date.toDateString();
    const rangeEnd = !!range.end && range.end.toDateString() === date.toDateString();
    const inRange = !!range.end && date > range.start && date < range.end;

    return { rangeStart, rangeEnd, inRange };
  }
}

interface CalendarDay {
  day: number;
  disabled: boolean;
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
}
