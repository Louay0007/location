// ═══════════════════════════════════════════════════════════════════════════
// MODAL COMPONENT — Apple-Style Design System
// ═══════════════════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div
          class="modal"
          [class.modal--sm]="size === 'sm'"
          [class.modal--lg]="size === 'lg'"
          [class.modal--full]="size === 'full'"
          role="dialog"
          [attr.aria-modal]="true"
          [attr.aria-label]="title"
        >
          <div class="modal__header">
            <h2 class="modal__title">{{ title }}</h2>
            @if (closeable) {
              <button class="modal__close" (click)="close()" type="button" aria-label="Fermer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            }
          </div>
          <div class="modal__body">
            <ng-content></ng-content>
          </div>
          @if (showFooter) {
            <div class="modal__footer">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: saturate(180%) blur(20px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      animation: modal-fade-in var(--duration-fast) var(--ease-default);
    }

    .modal {
      background: var(--bg-surface);
      border-radius: var(--radius-large);
      width: 90%;
      max-width: 480px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-modal);
      animation: modal-slide-in var(--duration-normal) var(--ease-out);
      overflow: hidden;
    }

    .modal--sm {
      max-width: 360px;
    }

    .modal--lg {
      max-width: 720px;
    }

    .modal--full {
      max-width: 100%;
      width: 100%;
      height: 100%;
      max-height: 100%;
      border-radius: 0;
    }

    .modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--border-color);
    }

    .modal__title {
      font-family: var(--font-display);
      font-size: var(--text-card);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-card);
      line-height: var(--leading-card);
      margin: 0;
    }

    .modal__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: var(--hover-bg);
      border-radius: var(--radius-circle);
      cursor: pointer;
      color: var(--text-secondary);
      transition: all var(--duration-fast) var(--ease-default);
    }
    .modal__close:hover {
      background: var(--active-bg);
      color: var(--text-primary);
    }
    .modal__close svg {
      width: 14px;
      height: 14px;
    }

    .modal__body {
      padding: var(--space-6);
      overflow-y: auto;
      flex: 1;
    }

    .modal__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--border-color);
    }

    @keyframes modal-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modal-slide-in {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class ModalComponent {
  @Input() title = '';
  @Input() size: ModalSize = 'md';
  @Input() closeable = true;
  @Input() showFooter = false;

  private readonly _visible = signal(false);
  readonly visible = this._visible.asReadonly();

  @Output() modalClose = new EventEmitter<void>();

  open(): void {
    this._visible.set(true);
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    if (!this.closeable) return;
    this._visible.set(false);
    document.body.style.overflow = '';
    this.modalClose.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
