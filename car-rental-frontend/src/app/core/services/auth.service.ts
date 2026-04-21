// ═════════════════════════════════════════════════════════════════════════════════════════
// AUTH SERVICE — Authentication & Session Management
// ═════════════════════════════════════════════════════════════════════════════════════════

import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ProfileUpdateRequest
} from '../models';

interface RegisterResponse {
  message: string;
  user: Partial<User>;
}

interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // ─────────────────────────────────────────────────────────────────────────
  // Signals (Angular 17+ reactive state)
  // ─────────────────────────────────────────────────────────────────────────

  private readonly _user = signal<User | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _isLoading = signal<boolean>(false);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isClient = computed(() => this._user()?.role === 'CLIENT');
  readonly fullName = computed(() => {
    const u = this._user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Storage Keys
  // ─────────────────────────────────────────────────────────────────────────

  private readonly ACCESS_TOKEN_KEY = 'access_token';
  // Refresh token is stored as httpOnly cookie by the backend — not accessible via JS

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────

  constructor() {
    if (this.isBrowser) {
      this.initializeAuth();
    }
  }

  private initializeAuth(): void {
    const token = this.getAccessToken();
    if (!token) return;

    // Try to validate the existing access token first
    this.validateToken().pipe(
      tap(user => {
        this._user.set(user);
        this._isAuthenticated.set(true);
      }),
      catchError(() => {
        // Access token expired — try refreshing via httpOnly cookie
        return this.refreshToken().pipe(
          tap(response => {
            this.setAccessToken(response.accessToken);
            this._user.set(response.user);
            this._isAuthenticated.set(true);
          }),
          catchError(() => {
            // Refresh also failed — clear everything
            this.clearAuth();
            return of(null);
          })
        );
      })
    ).subscribe();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Authentication Methods
  // ─────────────────────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    return this.api.postRaw<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        this.setAccessToken(response.accessToken);
        this._user.set(response.user);
        this._isAuthenticated.set(true);
        this._isLoading.set(false);
      }),
      catchError(error => {
        this._isLoading.set(false);
        throw error;
      })
    );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    this._isLoading.set(true);
    return this.api.postRaw<RegisterResponse>('/auth/register', data).pipe(
      tap(() => {
        this._isLoading.set(false);
      }),
      catchError(error => {
        this._isLoading.set(false);
        throw error;
      })
    );
  }

  logout(): Observable<MessageResponse> {
    return this.api.postRaw<MessageResponse>('/auth/logout', {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/']);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    // Refresh token is sent automatically via httpOnly cookie (withCredentials)
    return this.api.postRaw<AuthResponse>('/auth/refresh', {}).pipe(
      tap(response => {
        this.setAccessToken(response.accessToken);
        this._user.set(response.user);
      })
    );
  }

  verifyEmail(token: string): Observable<MessageResponse> {
    return this.api.getRaw<MessageResponse>(`/auth/verify-email?token=${token}`);
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.api.postRaw<MessageResponse>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<MessageResponse> {
    return this.api.postRaw<MessageResponse>('/auth/reset-password', {
      token,
      newPassword
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Profile Methods
  // ─────────────────────────────────────────────────────────────────────────

  getProfile(): Observable<User> {
    return this.api.getRaw<User>('/users/me').pipe(
      tap(user => this._user.set(user))
    );
  }

  updateProfile(data: ProfileUpdateRequest): Observable<User> {
    return this.api.putRaw<User>('/users/me', data).pipe(
      tap(user => this._user.set(user))
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.api.patchRaw<{ message: string }>('/users/me/password', {
      currentPassword,
      newPassword
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Token Management
  // ─────────────────────────────────────────────────────────────────────────

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  private clearAuth(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }
    this._user.set(null);
    this._isAuthenticated.set(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Token Validation
  // ─────────────────────────────────────────────────────────────────────────

  private validateToken(): Observable<User> {
    return this.api.getRaw<User>('/users/me');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  hasRole(role: 'ADMIN' | 'CLIENT'): boolean {
    return this._user()?.role === role;
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  mustReauthenticate(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }
}