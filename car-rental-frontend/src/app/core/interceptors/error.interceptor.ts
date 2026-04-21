// ═══════════════════════════════════════════════════════════════════════════
// ERROR INTERCEPTOR — Global Error Handling with Auto Token Refresh (Functional)
// ═══════════════════════════════════════════════════════════════════════════

import { inject } from '@angular/core';
import {
  HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, from, firstValueFrom } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(request, next, error, authService);
      }

      handleError(error, toastService);
      return throwError(() => error);
    })
  );
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  error: HttpErrorResponse,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  // If this is a refresh request itself failing, force re-auth
  if (request.url.includes('/auth/refresh')) {
    authService.mustReauthenticate();
    return throwError(() => error);
  }

  // If no access token at all, go straight to login
  if (!authService.getAccessToken()) {
    authService.mustReauthenticate();
    return throwError(() => error);
  }

  // Queue requests while refreshing
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addTokenHeader(request, token!)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return from(firstValueFrom(authService.refreshToken())).pipe(
    switchMap((response) => {
      isRefreshing = false;
      refreshTokenSubject.next(response.accessToken);
      return next(addTokenHeader(request, response.accessToken));
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      authService.mustReauthenticate();
      return throwError(() => refreshError);
    }),
    finalize(() => {
      isRefreshing = false;
    })
  );
}

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handleError(error: HttpErrorResponse, toastService: ToastService): void {
  if (error.status === 403) {
    toastService.error('Accès refusé');
  } else if (error.status === 404) {
    toastService.error('Ressource non trouvée');
  } else if (error.status === 409) {
    toastService.error('Conflit de données');
  } else if (error.status === 422) {
    toastService.error('Données invalides');
  } else if (error.status === 429) {
    toastService.error('Trop de requêtes. Veuillez patienter');
  } else if (error.status >= 500) {
    toastService.error('Erreur serveur');
  } else if (error.error?.message) {
    toastService.error(error.error.message);
  }
}
