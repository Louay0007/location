// ═════════════════════════════════════════════════════════════════════════════════════════
// LOADING SERVICE — Global Loading State
// ═════════════════════════════════════════════════════════════════════════════════════════

import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly _count = signal<number>(0);
  readonly isLoading = computed(() => this._count() > 0);
  readonly loadingCount = this._count.asReadonly();

  start(): void {
    this._count.update(count => count + 1);
  }

  stop(): void {
    this._count.update(count => Math.max(0, count - 1));
  }

  reset(): void {
    this._count.set(0);
  }
}
