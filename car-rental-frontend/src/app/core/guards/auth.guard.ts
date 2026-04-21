// ═════════════════════════════════════════════════════════════════════════════════════════
// AUTH GUARD — Route Protection
// ═════════════════════════════════════════════════════════════════════════════════════════

import { inject } from '@angular/core';
import { Router, CanActivateFn, CanMatchFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (!authService.isAdmin()) {
    return router.createUrlTree(['/']);
  }

  return true;
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const role = authService.user()?.role;
    if (role === 'ADMIN') {
      return router.createUrlTree(['/admin']);
    }
    return router.createUrlTree(['/']);
  }

  return true;
};

export const roleGuard = (allowedRoles: ('ADMIN' | 'CLIENT')[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const userRole = authService.user()?.role;
    if (userRole && allowedRoles.includes(userRole as 'ADMIN' | 'CLIENT')) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
};