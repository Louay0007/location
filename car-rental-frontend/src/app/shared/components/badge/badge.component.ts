// ═══════════════════════════════════════════════════════════════════════════
// BADGE COMPONENT — Status Badges & Counts
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="badge"
      [class.badge--small]="size === 'small'"
      [class.badge--medium]="size === 'medium'"
      [class.badge--large]="size === 'large'"
      [class.badge--default]="variant === 'default'"
      [class.badge--success]="variant === 'success'"
      [class.badge--warning]="variant === 'warning'"
      [class.badge--error]="variant === 'error'"
      [class.badge--info]="variant === 'info'"
      [class.badge--pill]="pill"
      [class.badge--count]="count"
    >
      @if (icon) {
        <svg class="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      }
      <span class="badge__content">
        <ng-content />
      </span>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-family: var(--font-body);
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      border-radius: var(--radius-micro);
      white-space: nowrap;
      transition: all var(--duration-fast) var(--ease-default);
    }

    /* ── Sizes ── */
    .badge--small {
      padding: var(--space-1) var(--space-2);
      font-size: var(--text-nano);
    }

    .badge--medium {
      padding: var(--space-1) var(--space-3);
    }

    .badge--large {
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-caption);
    }

    /* ── Variants ── */
    .badge--default {
      background: var(--bg-secondary);
      color: var(--text-secondary);
    }

    .badge--success {
      background: rgba(52, 199, 89, 0.1);
      color: var(--color-success);
    }

    .badge--warning {
      background: rgba(255, 149, 0, 0.1);
      color: var(--color-warning);
    }

    .badge--error {
      background: rgba(255, 59, 48, 0.1);
      color: var(--color-error);
    }

    .badge--info {
      background: rgba(0, 113, 227, 0.1);
      color: var(--color-apple-blue);
    }

    /* ── Modifiers ── */
    .badge--pill {
      border-radius: var(--radius-pill);
    }

    .badge--count {
      min-width: 18px;
      height: 18px;
      padding: 0 var(--space-1);
      border-radius: var(--radius-circle);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-nano);
    }
    .badge--count.badge--large {
      min-width: 20px;
      height: 20px;
    }

    .badge__icon {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }
    .badge--large .badge__icon {
      width: 14px;
      height: 14px;
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'medium';
  @Input() pill = false;
  @Input() count = false;
  @Input() icon = false;
}
