// ═══════════════════════════════════════════════════════════════════════════
// RADIO COMPONENT — Radio Button Group
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: RadioComponent,
      multi: true
    }
  ],
  template: `
    <div class="radio-group" [class.radio-group--disabled]="disabled">
      @if (label) {
        <span class="radio-group__label">{{ label }}</span>
      }
      <div class="radio-group__options">
        @for (option of options; track option.value) {
          <label class="radio" [class.radio--disabled]="option.disabled || disabled">
            <input
              type="radio"
              class="radio__input"
              [name]="name"
              [value]="option.value"
              [id]="name + '-' + option.value"
              [checked]="selectedValue === option.value"
              [disabled]="option.disabled || disabled"
              (change)="onSelect(option.value)"
            />
            <span class="radio__circle" [class.radio__circle--checked]="selectedValue === option.value">
              @if (selectedValue === option.value) {
                <span class="radio__dot"></span>
              }
            </span>
            <span class="radio__label">{{ option.label }}</span>
          </label>
        }
      </div>
      @if (hint) {
        <span class="radio-group__hint">{{ hint }}</span>
      }
      @if (error) {
        <span class="radio-group__error">{{ error }}</span>
      }
    </div>
  `,
  styles: [`
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .radio-group--disabled {
      opacity: 0.48;
      pointer-events: none;
    }

    .radio-group__label {
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      color: var(--text-secondary);
      letter-spacing: var(--tracking-micro);
    }

    .radio-group__options {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .radio {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      user-select: none;
    }
    .radio--disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }

    .radio__input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .radio__circle {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-circle);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--duration-fast) var(--ease-default);
      flex-shrink: 0;
    }
    .radio:hover:not(.radio--disabled) .radio__circle {
      border-color: var(--color-apple-blue);
    }
    .radio__circle--checked {
      border-color: var(--color-apple-blue);
    }

    .radio__dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-circle);
      background: var(--color-apple-blue);
    }

    .radio__label {
      font-size: var(--text-caption);
      color: var(--text-primary);
    }

    .radio-group__hint {
      font-size: var(--text-nano);
      color: var(--text-tertiary);
    }

    .radio-group__error {
      font-size: var(--text-nano);
      color: var(--color-error);
    }
  `]
})
export class RadioComponent implements ControlValueAccessor {
  @Input() name = '';
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() disabled = false;
  @Input() options: RadioOption[] = [];

  selectedValue = '';

  private onChange: ((value: string) => void) | null = null;
  private onTouched: (() => void) | null = null;

  writeValue(value: string): void {
    this.selectedValue = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(value: string): void {
    this.selectedValue = value;
    if (this.onChange) {
      this.onChange(value);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }
}
