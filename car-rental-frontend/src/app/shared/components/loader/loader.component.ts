// ═══════════════════════════════════════════════════════════════════════════
// LOADER COMPONENT — Spinner and Skeleton Loading States
// ═══════════════════════════════════════════════════════════════════════════

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoaderVariant = 'spinner' | 'skeleton';
export type LoaderSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (variant() === 'spinner') {
      <div class="loader loader--spinner" [class.loader--sm]="size() === 'sm'" [class.loader--lg]="size() === 'lg'">
        <svg class="loader__spinner" viewBox="0 0 24 24">
          <circle class="loader__circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
        </svg>
      </div>
    } @else if (variant() === 'skeleton') {
      <div class="loader loader--skeleton">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--line"></div>
        <div class="skeleton skeleton--line"></div>
        <div class="skeleton skeleton--line skeleton--short"></div>
      </div>
    }
  `,
  styles: [`
    .loader {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ── Spinner ── */
    .loader--spinner {
      width: 40px;
      height: 40px;
    }

    .loader--sm {
      width: 24px;
      height: 24px;
    }

    .loader--lg {
      width: 56px;
      height: 56px;
    }

    .loader__spinner {
      width: 100%;
      height: 100%;
      animation: spin 1s linear infinite;
    }

    .loader__circle {
      stroke: var(--color-apple-blue);
      stroke-dasharray: 60;
      stroke-dashoffset: 40;
      opacity: 0.6;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Skeleton ── */
    .loader--skeleton {
      width: 100%;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-6);
    }

    .skeleton {
      background: var(--bg-secondary);
      border-radius: var(--radius-standard);
      animation: shimmer 1.5s infinite;
    }

    .skeleton--title {
      width: 60%;
      height: 24px;
    }

    .skeleton--line {
      width: 100%;
      height: 16px;
    }

    .skeleton--short {
      width: 40%;
    }

    @keyframes shimmer {
      0% { opacity: 0.6; }
      50% { opacity: 0.4; }
      100% { opacity: 0.6; }
    }

    :host-context([data-theme="light"]) .skeleton {
      background: rgba(0, 0, 0, 0.05);
    }
  `]
})
export class LoaderComponent {
  readonly variant = input<LoaderVariant>('spinner');
  readonly size = input<LoaderSize>('md');
}
