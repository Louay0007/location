// ═══════════════════════════════════════════════════════════════════════════
// LOADING INTERCEPTOR — Global Loading State (Functional)
// ═══════════════════════════════════════════════════════════════════════════

import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (request.headers.has('X-Skip-Loading')) {
    return next(request);
  }

  const loadingService = inject(LoadingService);
  loadingService.start();

  return next(request).pipe(
    finalize(() => loadingService.stop())
  );
};
