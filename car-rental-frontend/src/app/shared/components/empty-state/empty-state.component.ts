// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE COMPONENT — Reusable Empty State for Lists and Pages
// ═══════════════════════════════════════════════════════════════════════════

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      @if (icon()) {
        <div class="empty-state__icon">
          <svg [attr.viewBox]="iconViewBox()" fill="none" stroke="currentColor" stroke-width="1.5">
            <ng-content select="[slot=icon]"></ng-content>
          </svg>
        </div>
      }
      @if (title()) {
        <h3 class="empty-state__title">{{ title() }}</h3>
      }
      @if (description()) {
        <p class="empty-state__description">{{ description() }}</p>
      }
      @if (actionText()) {
        <button class="empty-state__action" (click)="onAction()">
          {{ actionText() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-12) var(--space-6);
      gap: var(--space-4);
    }

    .empty-state__icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      opacity: 0.48;
    }

    .empty-state__icon svg {
      width: 100%;
      height: 100%;
    }

    .empty-state__title {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      margin: 0;
      letter-spacing: var(--tracking-tight);
    }

    .empty-state__description {
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: var(--leading-body);
      color: var(--text-secondary);
      margin: 0;
      max-width: 400px;
    }

    .empty-state__action {
      padding: var(--space-3) var(--space-6);
      background: var(--color-apple-blue);
      color: #ffffff;
      border: none;
      border-radius: var(--radius-pill);
      font-size: var(--text-body);
      font-weight: var(--weight-medium);
      cursor: pointer;
      transition: background var(--duration-fast) var(--ease-default);
    }

    .empty-state__action:hover {
      background: var(--color-apple-blue-hover);
    }
  `]
})
export class EmptyStateComponent {
  readonly icon = input(false);
  readonly iconViewBox = input('0 0 24 24');
  readonly title = input('');
  readonly description = input('');
  readonly actionText = input('');

  onAction(): void {
    // Can emit event if needed
  }
}
