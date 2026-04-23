// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE COMPONENT — On/Off Switch
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ToggleComponent,
      multi: true
    }
  ],
  template: `
    <label class="toggle" [class.toggle--disabled]="disabled">
      <input
        type="checkbox"
        class="toggle__input"
        [id]="id"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onToggle($event)"
      />
      <span class="toggle__track" [class.toggle__track--checked]="checked">
        <span class="toggle__thumb" [class.toggle__thumb--checked]="checked"></span>
      </span>
      @if (label) {
        <span class="toggle__label">{{ label }}</span>
      }
      <ng-content />
    </label>
  `,
  styles: [`
    .toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      user-select: none;
    }
    .toggle--disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }

    .toggle__input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle__track {
      width: 42px;
      height: 26px;
      background: var(--border-color);
      border-radius: var(--radius-pill);
      position: relative;
      transition: background var(--duration-fast) var(--ease-default);
      flex-shrink: 0;
    }
    .toggle:hover:not(.toggle--disabled) .toggle__track {
      background: var(--text-tertiary);
    }
    .toggle__track--checked {
      background: var(--color-success);
    }

    .toggle__thumb {
      width: 22px;
      height: 22px;
      background: #ffffff;
      border-radius: var(--radius-circle);
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform var(--duration-fast) var(--ease-default);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
    .toggle__thumb--checked {
      transform: translateX(16px);
    }

    .toggle__label {
      font-size: var(--text-caption);
      color: var(--text-primary);
    }
  `]
})
export class ToggleComponent implements ControlValueAccessor {
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
