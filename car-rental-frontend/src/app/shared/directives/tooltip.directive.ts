// ═══════════════════════════════════════════════════════════════════════════
// TOOLTIP DIRECTIVE — Hover tooltip with Apple-style design
// ═══════════════════════════════════════════════════════════════════════════

import { Directive, ElementRef, HostListener, inject, PLATFORM_ID, Inject, input, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
  host: {
    '[attr.aria-label]': 'tooltip()'
  }
})
export class TooltipDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly tooltip = input.required<string>();
  readonly position = input<'top' | 'bottom' | 'left' | 'right'>('top');

  private tooltipElement: HTMLElement | null = null;
  private showTimeout: any = null;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.isBrowser) return;
    this.showTimeout = setTimeout(() => this.show(), 300);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.isBrowser) return;
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    this.hide();
  }

  private show(): void {
    if (this.tooltipElement) return;

    const hostElement = this.elementRef.nativeElement;
    const rect = hostElement.getBoundingClientRect();

    this.tooltipElement = this.renderer.createElement('div');
    this.tooltipElement!.textContent = this.tooltip();
    this.renderer.addClass(this.tooltipElement, 'tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip--${this.position()}`);
    this.renderer.appendChild(document.body, this.tooltipElement);

    const tooltipRect = this.tooltipElement!.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (this.position()) {
      case 'top':
        top = rect.top - tooltipRect.height - 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + 8;
        break;
    }

    this.renderer.setStyle(this.tooltipElement!, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipElement!, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement!, 'left', `${left}px`);

    // Add styles dynamically since it's a directive
    const style = this.renderer.createElement('style');
    style.textContent = `
      .tooltip {
        background: var(--bg-elevated);
        color: var(--text-primary);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-standard);
        font-size: var(--text-micro);
        font-weight: var(--weight-medium);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: 1px solid var(--border-subtle);
        z-index: 9999;
        pointer-events: none;
        animation: tooltipFadeIn 0.15s ease-out;
        max-width: 250px;
        word-wrap: break-word;
      }
      .tooltip--top::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid var(--bg-elevated);
      }
      .tooltip--bottom::after {
        content: '';
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid var(--bg-elevated);
      }
      .tooltip--left::after {
        content: '';
        position: absolute;
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 6px solid var(--bg-elevated);
      }
      .tooltip--right::after {
        content: '';
        position: absolute;
        left: -6px;
        top: 50%;
        transform: translateY(-50%);
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 6px solid var(--bg-elevated);
      }
      @keyframes tooltipFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    this.renderer.appendChild(document.head, style);
  }

  private hide(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}
