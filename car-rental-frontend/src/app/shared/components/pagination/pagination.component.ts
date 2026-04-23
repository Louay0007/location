// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION COMPONENT — Page Controls with Total Count
// ═══════════════════════════════════════════════════════════════════════════

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination">
      <div class="pagination__info">
        <span class="pagination__info-text">
          Affichage de {{ startItem() }}-{{ endItem() }} sur {{ totalItems() }} éléments
        </span>
      </div>
      <div class="pagination__controls">
        <button
          class="pagination__button"
          [disabled]="currentPage() === 1"
          (click)="pageChange.emit(currentPage() - 1)"
          aria-label="Page précédente">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        @for (page of visiblePages(); track page) {
          @if (page === '...') {
            <span class="pagination__ellipsis">...</span>
          } @else {
            <button
              class="pagination__page"
              [class.pagination__page--active]="page === currentPage()"
              (click)="pageChange.emit(page as number)"
              [attr.aria-label]="'Page ' + page"
              [attr.aria-current]="page === currentPage() ? 'page' : null">
              {{ page }}
            </button>
          }
        }
        <button
          class="pagination__button"
          [disabled]="currentPage() === totalPages()"
          (click)="pageChange.emit(currentPage() + 1)"
          aria-label="Page suivante">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-6);
      padding: var(--space-4) 0;
    }

    @media (max-width: 640px) {
      .pagination {
        flex-direction: column;
        gap: var(--space-4);
      }
    }

    .pagination__info-text {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
    }

    .pagination__controls {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .pagination__button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: var(--radius-standard);
      color: var(--text-primary);
      cursor: pointer;
      transition: background var(--duration-fast) var(--ease-default);
    }

    .pagination__button:hover:not(:disabled) {
      background: var(--hover-bg);
    }

    .pagination__button:disabled {
      opacity: 0.32;
      cursor: not-allowed;
    }

    .pagination__button svg {
      width: 18px;
      height: 18px;
    }

    .pagination__page {
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      font-weight: var(--weight-medium);
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }

    .pagination__page:hover {
      background: var(--hover-bg);
    }

    .pagination__page--active {
      background: var(--color-apple-blue);
      color: #ffffff;
    }

    .pagination__page--active:hover {
      background: var(--color-apple-blue-hover);
    }

    .pagination__ellipsis {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      font-size: var(--text-micro);
    }
  `]
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageSize = input(10);
  readonly pageChange = output<number>();

  readonly startItem = computed(() => {
    return Math.min((this.currentPage() - 1) * this.pageSize() + 1, this.totalItems());
  });

  readonly endItem = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  readonly visiblePages = computed(() => {
    const pages: (number | string)[] = [];
    const current = this.currentPage();
    const total = this.totalPages();

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) {
        pages.push('...');
      }
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) {
        pages.push('...');
      }
      pages.push(total);
    }

    return pages;
  });
}
