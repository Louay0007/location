// ═══════════════════════════════════════════════════════════════════════════
// BUTTON COMPONENT — Apple-Style Design System
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="app-btn"
      [class.app-btn--primary]="variant === 'primary'"
      [class.app-btn--secondary]="variant === 'secondary'"
      [class.app-btn--outline]="variant === 'outline'"
      [class.app-btn--ghost]="variant === 'ghost'"
      [class.app-btn--danger]="variant === 'danger'"
      [class.app-btn--sm]="size === 'sm'"
      [class.app-btn--lg]="size === 'lg'"
      [class.app-btn--loading]="loading"
      [class.app-btn--full]="fullWidth"
      [disabled]="disabled || loading"}, {
      [type]="type"
      (click)="onClick($event)"
    >
      @if (iconLeft && !loading) {
        <span class="app-btn__icon app-btn__icon--left" [innerHTML]="iconLeft"></span>
      }
      @if (loading) {
        <span class="app-btn__spinner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
        </span>
      }
      <span class="app-btn__label"><ng-content></ng-content></span>
      @if (iconRight && !loading) {
        <span class="app-btn__icon app-btn__icon--right" [innerHTML]="iconRight"></span>
      }
    </button>
  `,
  styles: [`
    .app-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: 8px 15px;
      border-radius: var(--radius-standard);
      border: 1px solid transparent;
      font-family: var(--font-body);
      font-size: var(--text-button);
      font-weight: var(--weight-regular);
      line-height: 1;
      letter-spacing: var(--tracking-body);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
      outline: none;
      position: relative;
      white-space: nowrap;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .app-btn:focus-visible {
      outline: 2px solid var(--color-focus-ring);
      outline-offset: 2px;
    }

    .app-btn:disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }

    /* ── Variants ── */
    .app-btn--primary {
      background: var(--color-apple-blue);
      color: #ffffff;
    }
    .app-btn--primary:hover:not(:disabled) {
      background: var(--color-apple-blue-hover);
    }
    .app-btn--primary:active:not(:disabled) {
      background: var(--color-apple-blue-hover);
      transform: scale(0.98);
    }

    .app-btn--secondary {
      background: var(--bg-elevated);
      color: var(--text-primary);
      border-color: var(--border-color);
    }
    .app-btn--secondary:hover:not(:disabled) {
      background: var(--hover-bg);
    }
    .app-btn--secondary:active:not(:disabled) {
      background: var(--active-bg);
    }

    .app-btn--outline {
      background: transparent;
      color: var(--color-apple-blue);
      border-color: var(--color-apple-blue);
    }
    .app-btn--outline:hover:not(:disabled) {
      background: var(--hover-bg);
    }
    .app-btn--outline:active:not(:disabled) {
      background: var(--active-bg);
    }

    .app-btn--ghost {
      background: transparent;
      color: var(--text-primary);
      border-color: transparent;
    }
    .app-btn--ghost:hover:not(:disabled) {
      background: var(--hover-bg);
    }
    .app-btn--ghost:active:not(:disabled) {
      background: var(--active-bg);
    }

    .app-btn--danger {
      background: var(--color-error);
      color: #ffffff;
    }
    .app-btn--danger:hover:not(:disabled) {
      filter: brightness(1.1);
    }
    .app-btn--danger:active:not(:disabled) {
      transform: scale(0.98);
    }

    /* ── Sizes ── */
    .app-btn--sm {
      padding: 5px 10px;
      font-size: var(--text-caption);
    }
    .app-btn--lg {
      padding: 12px 24px;
      font-size: var(--text-subheading);
    }

    /* ── Full Width ── */
    .app-btn--full {
      width: 100%;
    }

    /* ── Loading ── */
    .app-btn--loading {
      pointer-events: none;
    }
    .app-btn__spinner {
      display: inline-flex;
      width: 18px;
      height: 18px;
    }
    .app-btn__spinner svg {
      width: 100%;
      height: 100%;
      animation: btn-spin 0.8s linear infinite;
    }

    /* ── Icons ── */
    .app-btn__icon {
      display: inline-flex;
      width: 18px;
      height: 18px;
    }

    .app-btn__label {
      display: inline-flex;
      align-items: center;
    }

    @keyframes btn-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;

  @Input() loading = false;

  @Output() appClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.appClick.emit(event);
    }
  }
}
