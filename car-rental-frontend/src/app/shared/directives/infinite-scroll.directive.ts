// ═══════════════════════════════════════════════════════════════════════════
// INFINITE SCROLL DIRECTIVE — Load more on scroll
// ═══════════════════════════════════════════════════════════════════════════

import { Directive, ElementRef, inject, PLATFORM_ID, Inject, input, output, OnDestroy, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
  host: {
    '(scroll)': 'onScroll($event)'
  }
})
export class InfiniteScrollDirective implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly threshold = input(100);
  readonly scrollBottom = output<void>();

  private observer: IntersectionObserver | null = null;
  private scrollTimeout: any = null;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Use IntersectionObserver for better performance
    const options = {
      root: this.elementRef.nativeElement,
      rootMargin: `${this.threshold()}px`,
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.debounceScroll();
        }
      });
    }, options);

    // Add sentinel element at the bottom
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.width = '100%';
    sentinel.style.position = 'absolute';
    sentinel.style.bottom = '0';
    sentinel.style.left = '0';
    this.elementRef.nativeElement.appendChild(sentinel);

    this.observer.observe(sentinel);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  onScroll(event: Event): void {
    if (!this.isBrowser) return;
    this.debounceScroll();
  }

  private debounceScroll(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      this.checkScroll();
    }, 100);
  }

  private checkScroll(): void {
    const element = this.elementRef.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const threshold = this.threshold();

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      this.scrollBottom.emit();
    }
  }
}
