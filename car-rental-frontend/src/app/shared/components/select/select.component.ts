// ═══════════════════════════════════════════════════════════════════════════
// SELECT COMPONENT — Dropdown Select with Search
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectComponent,
      multi: true
    }
  ],
  template: `
    <div class="select" [class.select--disabled]="disabled" [class.select--error]="error">
      @if (label) {
        <label class="select__label" [for]="id">{{ label }}</label>
      }

      <div class="select__wrapper" (click)="toggleDropdown()">
        <select
          [id]="id"
          class="select__native"
          [(ngModel)]="selectedValue"
          (ngModelChange)="onValueChange($event)"
          [disabled]="disabled"
          (click)="$event.stopPropagation()"
        >
          @if (placeholder) {
            <option value="">{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [value]="option.value" [disabled]="option.disabled">
              {{ option.label }}
            </option>
          }
        </select>

        <span class="select__arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>

      @if (hint) {
        <span class="select__hint">{{ hint }}</span>
      }
      @if (error) {
        <span class="select__error">{{ error }}</span>
      }
    </div>
  `,
  styles: [`
    .select {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .select__label {
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      color: var(--text-secondary);
      letter-spacing: var(--tracking-micro);
    }

    .select__wrapper {
      position: relative;
      cursor: pointer;
    }

    .select__native {
      width: 100%;
      padding: 10px 36px 10px 14px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-comfortable);
      background: var(--bg-secondary);
      font-family: var(--font-body);
      font-size: var(--text-body);
      color: var(--text-primary);
      outline: none;
      transition: all var(--duration-fast) var(--ease-default);
      appearance: none;
      cursor: pointer;
    }
    .select__native:focus {
      border-color: var(--color-apple-blue);
      box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
    }
    .select__native:disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }

    .select__arrow {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--text-tertiary);
      pointer-events: none;
    }

    .select--error .select__native {
      border-color: var(--color-error);
    }
    .select--error .select__native:focus {
      box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.15);
    }

    .select__hint {
      font-size: var(--text-nano);
      color: var(--text-tertiary);
    }

    .select__error {
      font-size: var(--text-nano);
      color: var(--color-error);
    }
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() disabled = false;
  @Input() options: SelectOption[] = [];

  private readonly _value = signal<string | number>('');
  readonly selectedValue = this._value.asReadonly();

  private onChange: ((value: string | number) => void) | null = null;
  private onTouched: (() => void) | null = null;

  writeValue(value: string | number): void {
    this._value.set(value || '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(value: string | number): void {
    this._value.set(value);
    if (this.onChange) {
      this.onChange(value);
    }
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      if (this.onTouched) {
        this.onTouched();
      }
    }
  }
}
