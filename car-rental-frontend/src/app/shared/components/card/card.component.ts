// ═══════════════════════════════════════════════════════════════════════════
// CARD COMPONENT — Reusable Card Container
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card"
      [class.card--default]="variant === 'default'"
      [class.card--elevated]="variant === 'elevated'"
      [class.card--outlined]="variant === 'outlined'"
      [class.card--padding-none]="padding === 'none'"
      [class.card--padding-small]="padding === 'small'"
      [class.card--padding-medium]="padding === 'medium'"
      [class.card--padding-large]="padding === 'large'"
      [class.card--clickable]="clickable"
    >
      @if (header) {
        <div class="card__header">
          <ng-content select="[header]" />
        </div>
      }
      <div class="card__body">
        <ng-content />
      </div>
      @if (footer) {
        <div class="card__footer">
          <ng-content select="[footer]" />
        </div>
      }
    </div>
  `,
  styles: [`
    .card {
      background: var(--bg-surface);
      border-radius: var(--radius-standard);
      transition: all var(--duration-fast) var(--ease-default);
    }

    /* ── Variants ── */
    .card--default {
      border: none;
    }

    .card--elevated {
      border: none;
      box-shadow: 0 3px 30px rgba(0, 0, 0, 0.22);
    }

    .card--outlined {
      border: 1px solid var(--border-color);
    }

    .card--clickable {
      cursor: pointer;
    }
    .card--clickable:hover {
      background: var(--hover-bg);
    }

    /* ── Padding ── */
    .card--padding-none .card__body {
      padding: 0;
    }

    .card--padding-small .card__body {
      padding: var(--space-3);
    }

    .card--padding-medium .card__body {
      padding: var(--space-4);
    }

    .card--padding-large .card__body {
      padding: var(--space-6);
    }

    .card__header {
      padding: var(--space-4) var(--space-4) var(--space-3);
      border-bottom: 1px solid var(--border-color);
    }
    .card--padding-small .card__header {
      padding: var(--space-2) var(--space-3);
    }
    .card--padding-large .card__header {
      padding: var(--space-5) var(--space-6) var(--space-4);
    }
    .card--padding-none .card__header,
    .card--outlined .card__header {
      border-bottom: 1px solid var(--border-color);
    }
    .card--default .card__header {
      border-bottom: none;
    }

    .card__body {
      flex: 1;
    }

    .card__footer {
      padding: var(--space-3) var(--space-4);
      border-top: 1px solid var(--border-color);
    }
    .card--padding-small .card__footer {
      padding: var(--space-2) var(--space-3);
    }
    .card--padding-large .card__footer {
      padding: var(--space-4) var(--space-6);
    }
    .card--padding-none .card__footer,
    .card--outlined .card__footer {
      border-top: 1px solid var(--border-color);
    }
    .card--default .card__footer {
      border-top: none;
    }
  `]
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() padding: CardPadding = 'medium';
  @Input() header = false;
  @Input() footer = false;
  @Input() clickable = false;
}
