// ═══════════════════════════════════════════════════════════════════════════
// BREADCRUMBS COMPONENT — Navigation Breadcrumbs with Chevron Separator
// ═══════════════════════════════════════════════════════════════════════════

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumbs" aria-label="Fil d'ariane">
      <ol class="breadcrumbs__list">
        @for (item of items(); track item.label; let last = $last) {
          <li class="breadcrumbs__item" [class.breadcrumbs__item--last]="last">
            @if (!last && item.path) {
              <a [routerLink]="item.path" class="breadcrumbs__link">
                {{ item.label }}
              </a>
            } @else {
              <span class="breadcrumbs__current">{{ item.label }}</span>
            }
            @if (!last) {
              <svg class="breadcrumbs__separator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumbs {
      padding: var(--space-4) 0;
    }

    .breadcrumbs__list {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .breadcrumbs__item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-micro);
    }

    .breadcrumbs__link {
      color: var(--text-tertiary);
      text-decoration: none;
      transition: color var(--duration-fast) var(--ease-default);
    }

    .breadcrumbs__link:hover {
      color: var(--color-apple-blue);
    }

    .breadcrumbs__current {
      color: var(--text-secondary);
      font-weight: var(--weight-medium);
    }

    .breadcrumbs__separator {
      width: 14px;
      height: 14px;
      opacity: 0.32;
      flex-shrink: 0;
    }
  `]
})
export class BreadcrumbsComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
