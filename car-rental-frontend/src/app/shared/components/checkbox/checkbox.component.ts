// ═══════════════════════════════════════════════════════════════════════════
// CHECKBOX COMPONENT — Custom Styled Checkbox
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CheckboxComponent,
      multi: true
    }
  ],
  template: `
    <label class="checkbox" [class.checkbox--disabled]="disabled">
      <input
        type="checkbox"
        class="checkbox__input"
        [id]="id"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onToggle($event)"
      />
      <span class="checkbox__box" [class.checkbox__box--checked]="checked">
        @if (checked) {
          <svg class="checkbox__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        }
      </span>
      @if (label) {
        <span class="checkbox__label">{{ label }}</span>
      }
      <ng-content />
    </label>
  `,
  styles: [`
    .checkbox {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      user-select: none;
    }
    .checkbox--disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }

    .checkbox__input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .checkbox__box {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-micro);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--duration-fast) var(--ease-default);
      flex-shrink: 0;
    }
    .checkbox:hover:not(.checkbox--disabled) .checkbox__box {
      border-color: var(--color-apple-blue);
    }
    .checkbox__box--checked {
      background: var(--color-apple-blue);
      border-color: var(--color-apple-blue);
    }

    .checkbox__check {
      width: 12px;
      height: 12px;
      color: #ffffff;
    }

    .checkbox__label {
      font-size: var(--text-caption);
      color: var(--text-primary);
    }
  `]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() disabled = false;
  @Input() checked = false;

  private onChange: ((checked: boolean) => void) | null = null;
  private onTouched: (() => void) | null = null;

  writeValue(checked: boolean): void {
    this.checked = checked;
  }

  registerOnChange(fn: (checked: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    if (this.onChange) {
      this.onChange(this.checked);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }
}
