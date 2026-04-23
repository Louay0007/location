// ═══════════════════════════════════════════════════════════════════════════
// DROPDOWN COMPONENT — Action/Option Menu
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownItem {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown" [class.dropdown--open]="isOpen()">
      <button
        class="dropdown__trigger"
        (click)="toggle()"
        [disabled]="disabled"
      >
        <ng-content select="[trigger]" />
      </button>

      @if (isOpen()) {
        <div class="dropdown__menu" (click)="$event.stopPropagation()">
          @for (item of items; track item.value) {
            <button
              class="dropdown__item"
              [class.dropdown__item--disabled]="item.disabled"
              [class.dropdown__item--danger]="item.danger"
              (click)="select(item)"
              [disabled]="item.disabled"
            >
              @if (item.icon) {
                <span class="dropdown__icon">{{ item.icon }}</span>
              }
              <span class="dropdown__label">{{ item.label }}</span>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dropdown {
      position: relative;
      display: inline-block;
    }

    .dropdown__trigger {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }

    .dropdown__menu {
      position: absolute;
      top: calc(100% + var(--space-1));
      right: 0;
      min-width: 180px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-standard);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 100;
      padding: var(--space-1);
      display: flex;
      flex-direction: column;
      animation: dropdownIn var(--duration-fast) var(--ease-default);
    }

    @keyframes dropdownIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown__item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: none;
      border: none;
      border-radius: var(--radius-micro);
      cursor: pointer;
      font-family: var(--font-body);
      font-size: var(--text-caption);
      color: var(--text-primary);
      text-align: left;
      width: 100%;
      transition: background var(--duration-fast) var(--ease-default);
    }
    .dropdown__item:hover:not(.dropdown__item--disabled) {
      background: var(--hover-bg);
    }
    .dropdown__item--disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }
    .dropdown__item--danger {
      color: var(--color-error);
    }
    .dropdown__item--danger:hover:not(.dropdown__item--disabled) {
      background: rgba(255, 59, 48, 0.1);
    }

    .dropdown__icon {
      flex-shrink: 0;
    }

    .dropdown__label {
      flex: 1;
    }
  `]
})
export class DropdownComponent {
  @Input() items: DropdownItem[] = [];
  @Input() disabled = false;
  @Output() itemSelected = new EventEmitter<DropdownItem>();

  readonly isOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.dropdown')) {
      this.isOpen.set(false);
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    if (!this.disabled) {
      this.isOpen.update(open => !open);
    }
  }

  select(item: DropdownItem): void {
    if (!item.disabled) {
      this.itemSelected.emit(item);
      this.isOpen.set(false);
    }
  }
}
