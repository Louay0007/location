// ═══════════════════════════════════════════════════════════════════════════
// INPUT COMPONENT — Apple-Style Design System
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="app-input" [class.app-input--error]="error" [class.app-input--disabled]="disabled">
      @if (label) {
        <label class="app-input__label" [attr.for]="id">{{ label }}</label>
      }
      <div class="app-input__wrapper">
        @if (prefix) {
          <span class="app-input__prefix">{{ prefix }}</span>
        }
        @if (type === 'textarea') {
          <textarea
            [id]="id"
            class="app-input__field app-input__field--textarea"
            [placeholder]="placeholder"
            [disabled]="disabled"
            [rows]="rows"
            [attr.maxlength]="maxlength"
            [value]="value()"
            (input)="onInput($event)"
            (blur)="onTouched()"
            (focus)="onFocus()"
          ></textarea>
        } @else {
          <input
            [id]="id"
            [type]="showPassword ? 'text' : type"
            class="app-input__field"
            [placeholder]="placeholder"
            [disabled]="disabled"
            [attr.maxlength]="maxlength"
            [value]="value()"
            (input)="onInput($event)"
            (blur)="onTouched()"
            (focus)="onFocus()"
          />
        }
        @if (type === 'password') {
          <button
            type="button"
            class="app-input__toggle-password"
            (click)="togglePassword()"
            tabindex="-1"
          >
            @if (showPassword) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            }
          </button>
        }
        @if (suffix) {
          <span class="app-input__suffix">{{ suffix }}</span>
        }
      </div>
      @if (error) {
        <span class="app-input__error">{{ error }}</span>
      } @else if (hint) {
        <span class="app-input__hint">{{ hint }}</span>
      }
    </div>
  `,
  styles: [`
    .app-input {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      width: 100%;
    }

    .app-input__label {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-link);
    }

    .app-input__wrapper {
      display: flex;
      align-items: center;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-comfortable);
      transition: all var(--duration-fast) var(--ease-default);
      overflow: hidden;
    }

    .app-input__wrapper:focus-within {
      border-color: var(--color-apple-blue);
      box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
    }

    .app-input--error .app-input__wrapper {
      border-color: var(--color-error);
    }
    .app-input--error .app-input__wrapper:focus-within {
      box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.15);
    }

    .app-input--disabled .app-input__wrapper {
      opacity: 0.48;
      cursor: not-allowed;
    }

    .app-input__field {
      flex: 1;
      padding: 10px 14px;
      border: none;
      background: transparent;
      font-family: var(--font-body);
      font-size: var(--text-body);
      font-weight: var(--weight-regular);
      color: var(--text-primary);
      letter-spacing: var(--tracking-body);
      outline: none;
      width: 100%;
    }

    .app-input__field::placeholder {
      color: var(--text-tertiary);
    }

    .app-input__field:disabled {
      cursor: not-allowed;
    }

    .app-input__field--textarea {
      resize: vertical;
      min-height: 80px;
    }

    .app-input__prefix,
    .app-input__suffix {
      padding: 0 var(--space-3);
      font-size: var(--text-caption);
      color: var(--text-tertiary);
      white-space: nowrap;
    }

    .app-input__toggle-password {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 var(--space-2);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-tertiary);
    }
    .app-input__toggle-password:hover {
      color: var(--text-secondary);
    }
    .app-input__toggle-password svg {
      width: 18px;
      height: 18px;
    }

    .app-input__error {
      font-size: var(--text-micro);
      color: var(--color-error);
      letter-spacing: var(--tracking-micro);
    }

    .app-input__hint {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
      letter-spacing: var(--tracking-micro);
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${InputComponent.nextId++}`;
  @Input() label = '';
  @Input() type: 'text' | 'password' | 'email' | 'number' | 'textarea' = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() disabled = false;
  @Input() maxlength?: number;
  @Input() rows = 4;

  private static nextId = 0;

  readonly value = signal<string>('');
  showPassword = false;

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value.set(val || '');
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

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const val = target.value;
    this.value.set(val);
    this.onChange(val);
  }

  onFocus(): void {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
