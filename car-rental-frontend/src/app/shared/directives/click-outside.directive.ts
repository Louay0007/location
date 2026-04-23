// ═══════════════════════════════════════════════════════════════════════════
// CLICK OUTSIDE DIRECTIVE — Close dropdowns/modals on outside click
// ═══════════════════════════════════════════════════════════════════════════

import { Directive, ElementRef, EventEmitter, Output, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
  host: {
    '(document:click)': 'onClick($event)'
  }
})
export class ClickOutsideDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @Output() readonly appClickOutside = new EventEmitter<void>();

  onClick(event: MouseEvent): void {
    if (!this.isBrowser) return;

    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
}
