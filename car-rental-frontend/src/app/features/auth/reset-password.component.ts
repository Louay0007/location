// ═══════════════════════════════════════════════════════════════════════════
// RESET PASSWORD PAGE — Apple-Style Password Reset
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="reset">
      <div class="reset__card">
        @if (!isSuccess()) {
          <div class="reset__header">
            <div class="reset__icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h1 class="reset__title">Nouveau mot de passe</h1>
            <p class="reset__subtitle">
              Choisissez un mot de passe sécurisé pour votre compte.
            </p>
          </div>

          @if (errorMessage()) {
            <div class="reset__alert reset__alert--error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form class="reset__form" (ngSubmit)="onSubmit()" #resetForm="ngForm">
            <div class="reset__field">
              <label class="reset__label" for="newPassword">Nouveau mot de passe</label>
              <div class="reset__input-wrapper">
                <svg class="reset__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="newPassword"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="reset__input"
                  placeholder="Minimum 8 caractères"
                  [(ngModel)]="newPassword"
                  name="newPassword"
                  required
                  minlength="8"
                  autocomplete="new-password">
                <button type="button" class="reset__toggle-password" (click)="showPassword.set(!showPassword())">
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

            <div class="reset__field">
              <label class="reset__label" for="confirmPassword">Confirmer le mot de passe</label>
              <div class="reset__input-wrapper">
                <svg class="reset__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <input
                  id="confirmPassword"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="reset__input"
                  placeholder="Confirmez le mot de passe"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  autocomplete="new-password">
              </div>
              @if (confirmPassword && newPassword !== confirmPassword) {
                <span class="reset__mismatch">Les mots de passe ne correspondent pas</span>
              }
            </div>

            <button
              type="submit"
              class="reset__submit"
              [disabled]="resetForm.invalid || isLoading() || newPassword !== confirmPassword">
              @if (isLoading()) {
                <svg class="reset__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                </svg>
              } @else {
                Réinitialiser le mot de passe
              }
            </button>
          </form>
        } @else {
          <div class="reset__success">
            <div class="reset__icon-wrapper reset__icon-wrapper--success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 class="reset__title">Mot de passe réinitialisé</h1>
            <p class="reset__subtitle">
              Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.
            </p>
            <a routerLink="/auth/login" class="reset__submit">
              Se connecter
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .reset {
      width: 100%;
    }

    .reset__card {
      background: var(--bg-surface);
      border-radius: var(--radius-large);
      padding: var(--space-10);
      border: 1px solid var(--border-color);
    }

    .reset__header,
    .reset__success {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .reset__icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-large);
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-6);
      color: var(--color-apple-blue);
    }

    .reset__icon-wrapper svg {
      width: 28px;
      height: 28px;
    }

    .reset__icon-wrapper--success {
      color: #34c759;
    }

    .reset__title {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-2);
      letter-spacing: var(--tracking-tight);
    }

    .reset__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      color: var(--text-secondary);
      max-width: 360px;
      margin: 0 auto;
      line-height: var(--leading-caption);
    }

    .reset__alert {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      margin-bottom: var(--space-6);
    }

    .reset__alert--error {
      background: rgba(255, 59, 48, 0.1);
      color: var(--color-error);
      border: 1px solid rgba(255, 59, 48, 0.25);
    }

    .reset__alert svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .reset__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .reset__field {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .reset__label {
      font-family: var(--font-body);
      font-size: var(--text-nano);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      color: var(--text-tertiary);
      letter-spacing: 0.05em;
    }

    .reset__input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .reset__input-icon {
      position: absolute;
      left: var(--space-4);
      width: 18px;
      height: 18px;
      color: var(--text-tertiary);
      pointer-events: none;
    }

    .reset__input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      padding-left: var(--space-10);
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-comfortable);
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: var(--text-body);
      outline: none;
      transition: border-color var(--duration-fast) var(--ease-default),
                  background var(--duration-fast) var(--ease-default);
    }

    .reset__input::placeholder {
      color: var(--text-tertiary);
    }

    .reset__input:focus {
      border-color: var(--color-apple-blue);
      background: var(--bg-secondary);
    }

    .reset__toggle-password {
      position: absolute;
      right: var(--space-3);
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: var(--space-1);
      display: flex;
      align-items: center;
    }

    .reset__toggle-password svg {
      width: 18px;
      height: 18px;
    }

    .reset__toggle-password:hover {
      color: var(--text-secondary);
    }

    .reset__mismatch {
      font-size: var(--text-micro);
      color: #ff6b6b;
    }

    .reset__submit {
      width: 100%;
      padding: var(--space-3) var(--space-6);
      background: var(--color-apple-blue);
      color: var(--bg-primary);
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
      text-decoration: none;
    }

    .reset__submit:hover:not(:disabled) {
      background: var(--color-bright-blue);
    }

    .reset__submit:active:not(:disabled) {
      transform: scale(0.98);
    }

    .reset__submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .reset__spinner {
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .reset__card {
        padding: var(--space-8) var(--space-6);
      }

      .reset__title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  newPassword = '';
  confirmPassword = '';
  token = '';

  showPassword = signal(false);
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage.set('Lien de réinitialisation invalide ou expiré');
    }
  }

  onSubmit(): void {
    if (!this.token || !this.newPassword || this.newPassword !== this.confirmPassword) return;

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.message || 'Erreur lors de la réinitialisation');
      }
    });
  }
}
