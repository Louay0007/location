// ═══════════════════════════════════════════════════════════════════════════
// LOGIN PAGE — Apple-Style Authentication
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login">
      <div class="login__card">
        <div class="login__header">
          <h1 class="login__title">Connexion</h1>
          <p class="login__subtitle">Accédez à votre espace privé.</p>
        </div>

        @if (errorMessage()) {
          <div class="login__alert login__alert--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form class="login__form" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="login__field">
            <label class="login__label" for="email">Adresse email</label>
            <div class="login__input-wrapper">
              <svg class="login__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                id="email"
                type="email"
                class="login__input"
                placeholder="votre@email.com"
                [(ngModel)]="email"
                name="email"
                required
                email
                autocomplete="email">
            </div>
          </div>

          <div class="login__field">
            <label class="login__label" for="password">
              Mot de passe
            </label>
            <div class="login__input-wrapper">
              <svg class="login__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                class="login__input"
                placeholder="Mot de passe"
                [(ngModel)]="password"
                name="password"
                required
                minlength="8"
                autocomplete="current-password">
              <button type="button" class="login__toggle-password" (click)="showPassword.set(!showPassword())">
                @if (showPassword()) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                }
              </button>
            </div>
          </div>

          <div class="login__options">
            <a routerLink="/auth/forgot-password" class="login__forgot">Mot de passe oublié ?</a>
          </div>

          <button
            type="submit"
            class="login__submit"
            [disabled]="loginForm.invalid || isLoading()">
            @if (isLoading()) {
              <svg class="login__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"></path>
              </svg>
            } @else {
              Se connecter
            }
          </button>
        </form>

        <div class="login__divider">
          <span>ou</span>
        </div>

        <p class="login__register">
          Pas encore de compte ?
          <a routerLink="/auth/register" class="login__register-link">Créer un compte</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login {
      width: 100%;
    }

    .login__card {
      background: var(--color-dark-surface-1);
      border-radius: var(--radius-large);
      padding: var(--space-10);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .login__header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .login__title {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: var(--weight-semibold);
      color: var(--color-white);
      margin-bottom: var(--space-2);
      letter-spacing: var(--tracking-tight);
    }

    .login__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      color: var(--color-text-white-secondary);
    }

    .login__alert {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      margin-bottom: var(--space-6);
    }

    .login__alert--error {
      background: rgba(255, 59, 48, 0.1);
      color: #ff6b6b;
      border: 1px solid rgba(255, 59, 48, 0.2);
    }

    .login__alert svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .login__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .login__field {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .login__label {
      font-family: var(--font-body);
      font-size: var(--text-nano);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      color: var(--color-text-white-tertiary);
      letter-spacing: 0.05em;
    }

    .login__input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .login__input-icon {
      position: absolute;
      left: var(--space-4);
      width: 18px;
      height: 18px;
      color: var(--color-text-white-tertiary);
      pointer-events: none;
    }

    .login__input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      padding-left: var(--space-10);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-comfortable);
      color: var(--color-white);
      font-family: var(--font-body);
      font-size: var(--text-body);
      outline: none;
      transition: border-color var(--duration-fast) var(--ease-default),
                  background var(--duration-fast) var(--ease-default);
    }

    .login__input::placeholder {
      color: var(--color-text-white-tertiary);
    }

    .login__input:focus {
      border-color: var(--color-apple-blue);
      background: rgba(255, 255, 255, 0.06);
    }

    .login__input.ng-invalid.ng-touched {
      border-color: rgba(255, 59, 48, 0.5);
    }

    .login__toggle-password {
      position: absolute;
      right: var(--space-3);
      background: none;
      border: none;
      color: var(--color-text-white-tertiary);
      cursor: pointer;
      padding: var(--space-1);
      display: flex;
      align-items: center;
    }

    .login__toggle-password svg {
      width: 18px;
      height: 18px;
    }

    .login__toggle-password:hover {
      color: var(--color-text-white-secondary);
    }

    .login__options {
      display: flex;
      justify-content: flex-end;
    }

    .login__forgot {
      font-family: var(--font-body);
      font-size: var(--text-link);
      color: var(--color-bright-blue);
      text-decoration: none;
      transition: opacity var(--duration-fast) var(--ease-default);
    }

    .login__forgot:hover {
      opacity: 0.8;
    }

    .login__submit {
      width: 100%;
      padding: var(--space-3) var(--space-6);
      background: var(--color-apple-blue);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-pill);
      font-family: var(--font-body);
      font-size: var(--text-body);
      font-weight: var(--weight-medium);
      cursor: pointer;
      transition: background var(--duration-fast) var(--ease-default),
                  transform var(--duration-fast) var(--ease-default);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 48px;
    }

    .login__submit:hover:not(:disabled) {
      background: var(--color-bright-blue);
    }

    .login__submit:active:not(:disabled) {
      transform: scale(0.98);
    }

    .login__submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .login__spinner {
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .login__divider {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin: var(--space-8) 0;
    }

    .login__divider::before,
    .login__divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
    }

    .login__divider span {
      font-size: var(--text-micro);
      color: var(--color-text-white-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .login__register {
      text-align: center;
      font-family: var(--font-body);
      font-size: var(--text-caption);
      color: var(--color-text-white-secondary);
    }

    .login__register-link {
      color: var(--color-bright-blue);
      text-decoration: none;
      font-weight: var(--weight-medium);
      transition: opacity var(--duration-fast) var(--ease-default);
    }

    .login__register-link:hover {
      opacity: 0.8;
    }

    @media (max-width: 480px) {
      .login__card {
        padding: var(--space-8) var(--space-6);
      }

      .login__title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/vehicles';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        const serverError = err?.originalError?.message || err?.message;
        this.errorMessage.set(serverError || 'Email ou mot de passe incorrect');
      }
    });
  }
}
