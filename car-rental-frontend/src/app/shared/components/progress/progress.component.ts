// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS COMPONENT — Progress Bars
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';
export type ProgressSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress" [class.progress--small]="size === 'small'" [class.progress--medium]="size === 'medium'" [class.progress--large]="size === 'large'">
      @if (showLabel) {
        <div class="progress__header">
          @if (label) {
            <span class="progress__label">{{ label }}</span>
          }
          <span class="progress__value">{{ percentage() }}%</span>
        </div>
      }
      <div class="progress__track">
        <div
          class="progress__bar"
          [class.progress__bar--default]="variant === 'default'"
          [class.progress__bar--success]="variant === 'success'"
          [class.progress__bar--warning]="variant === 'warning'"
          [class.progress__bar--error]="variant === 'error'"
          [style.width.%]="percentage()"
        ></div>
      </div>
      @if (showLabel && description) {
        <span class="progress__description">{{ description }}</span>
      }
    </div>
  `,
  styles: [`
    .progress {
      width: 100%;
    }

    .progress__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-1);
    }

    .progress__label {
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      color: var(--text-secondary);
    }

    .progress__value {
      font-size: var(--text-micro);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    .progress__track {
      width: 100%;
      height: 6px;
      background: var(--bg-secondary);
      border-radius: var(--radius-pill);
      overflow: hidden;
    }
    .progress--small .progress__track {
      height: 4px;
    }
    .progress--large .progress__track {
      height: 8px;
    }

    .progress__bar {
      height: 100%;
      border-radius: var(--radius-pill);
      transition: width var(--duration-normal) var(--ease-default);
    }

    .progress__bar--default {
      background: var(--color-apple-blue);
    }

    .progress__bar--success {
      background: var(--color-success);
    }

    .progress__bar--warning {
      background: var(--color-warning);
    }

    .progress__bar--error {
      background: var(--color-error);
    }

    .progress__description {
      display: block;
      margin-top: var(--space-1);
      font-size: var(--text-nano);
      color: var(--text-tertiary);
    }
  `]
})
export class ProgressComponent {
  @Input() value = 0;
  @Input() max = 100;
  @Input() label = '';
  @Input() description = '';
  @Input() showLabel = false;
  @Input() variant: ProgressVariant = 'default';
  @Input() size: ProgressSize = 'medium';

  readonly percentage = computed(() => {
    const pct = (this.value / this.max) * 100;
    return Math.min(100, Math.max(0, Math.round(pct)));
  });
}
