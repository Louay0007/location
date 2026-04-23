// ═══════════════════════════════════════════════════════════════════════════
// TOAST COMPONENT — Apple-Style Notification System
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast--success]="toast.type === 'success'"
          [class.toast--error]="toast.type === 'error'"
          [class.toast--warning]="toast.type === 'warning'"
          [class.toast--info]="toast.type === 'info'"
          @toastAnimation
        >
          <div class="toast__icon">
            @switch (toast.type) {
              @case ('success') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              }
              @case ('error') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              }
              @case ('warning') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              }
              @case ('info') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              }
            }
          </div>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__dismiss" (click)="toastService.dismiss(toast.id)" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--space-6);
      right: var(--space-6);
      z-index: var(--z-tooltip);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      pointer-events: none;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--bg-surface);
      border-radius: var(--radius-standard);
      box-shadow: var(--shadow-card);
      pointer-events: auto;
      animation: toast-slide-in var(--duration-normal) var(--ease-out);
      border-left: 3px solid var(--text-tertiary);
    }

    .toast--success { border-left-color: var(--color-success); }
    .toast--error { border-left-color: var(--color-error); }
    .toast--warning { border-left-color: var(--color-warning); }
    .toast--info { border-left-color: var(--color-apple-blue); }

    .toast__icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }
    .toast--success .toast__icon { color: var(--color-success); }
    .toast--error .toast__icon { color: var(--color-error); }
    .toast--warning .toast__icon { color: var(--color-warning); }
    .toast--info .toast__icon { color: var(--color-apple-blue); }

    .toast__icon svg {
      width: 100%;
      height: 100%;
    }

    .toast__message {
      flex: 1;
      font-size: var(--text-caption);
      color: var(--text-primary);
      letter-spacing: var(--tracking-link);
      line-height: var(--leading-caption);
    }

    .toast__dismiss {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--text-tertiary);
      border-radius: var(--radius-circle);
      transition: all var(--duration-fast) var(--ease-default);
    }
    .toast__dismiss:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
    }
    .toast__dismiss svg {
      width: 14px;
      height: 14px;
    }

    @keyframes toast-slide-in {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
  `],
  animations: []
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
