// ═══════════════════════════════════════════════════════════════════════════
// AUTO FOCUS DIRECTIVE — Auto-focus input on mount
// ═══════════════════════════════════════════════════════════════════════════

import { Directive, ElementRef, inject, PLATFORM_ID, Inject, AfterViewInit, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit {
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.elementRef.nativeElement.focus();
      }, 0);
    }
  }
}
