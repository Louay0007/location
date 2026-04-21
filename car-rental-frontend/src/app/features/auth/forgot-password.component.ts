// ═══════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD PAGE — Apple-Style Password Reset Request
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="forgot">
      <div class="forgot__card">
        @if (!isSent()) {
          <div class="forgot__header">
            <div class="forgot__icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h1 class="forgot__title">Mot de passe oublié</h1>
            <p class="forgot__subtitle">
              Entrez votre email et nous vous enverrons un lien de réinitialisation.
            </p>
          </div>

          @if (errorMessage()) {
            <div class="forgot__alert forgot__alert--error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form class="forgot__form" (ngSubmit)="onSubmit()" #forgotForm="ngForm">
            <div class="forgot__field">
              <label class="forgot__label" for="email">Adresse email</label>
              <div class="forgot__input-wrapper">
                <svg class="forgot__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  id="email"
                  type="email"
                  class="forgot__input"
                  placeholder="votre@email.com"
                  [(ngModel)]="email"
                  name="email"
                  required
                  email
                  autocomplete="email">
              </div>
            </div>

            <button
              type="submit"
              class="forgot__submit"
              [disabled]="forgotForm.invalid || isLoading()">
              @if (isLoading()) {
                <svg class="forgot__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                </svg>
              } @else {
                Envoyer le lien
              }
            </button>
          </form>
        } @else {
          <div class="forgot__success">
            <div class="forgot__icon-wrapper forgot__icon-wrapper--success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h1 class="forgot__title">Email envoyé</h1>
            <p class="forgot__subtitle">
              Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.
            </p>
          </div>
        }

        <div class="forgot__divider">
          <span>ou</span>
        </div>

        <p class="forgot__back">
          <a routerLink="/auth/login" class="forgot__back-link">Retour à la connexion</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .forgot {
      width: 100%;
    }

    .forgot__card {
      background: var(--color-dark-surface-1);
      border-radius: var(--radius-large);
      padding: var(--space-10);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .forgot__header,
    .forgot__success {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .forgot__icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-large);
      background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-6);
      color: var(--color-apple-blue);
    }

    .forgot__icon-wrapper svg {
      width: 28px;
      height: 28px;
    }

    .forgot__icon-wrapper--success {
      color: #34c759;
    }

    .forgot__title {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: var(--weight-semibold);
      color: var(--color-white);
      margin-bottom: var(--space-2);
      letter-spacing: var(--tracking-tight);
    }

    .forgot__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      color: var(--color-text-white-secondary);
      max-width: 360px;
      margin: 0 auto;
      line-height: var(--leading-caption);
    }

    .forgot__alert {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      margin-bottom: var(--space-6);
    }

    .forgot__alert--error {
      background: rgba(255, 59, 48, 0.1);
      color: #ff6b6b;
      border: 1px solid rgba(255, 59, 48, 0.2);
    }

    .forgot__alert svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .forgot__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .forgot__field {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .forgot__label {
      font-family: var(--font-body);
      font-size: var(--text-nano);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      color: var(--color-text-white-tertiary);
      letter-spacing: 0.05em;
    }

    .forgot__input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .forgot__input-icon {
      position: absolute;
      left: var(--space-4);
      width: 18px;
      height: 18px;
      color: var(--color-text-white-tertiary);
      pointer-events: none;
    }

    .forgot__input {
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

    .forgot__input::placeholder {
      color: var(--color-text-white-tertiary);
    }

    .forgot__input:focus {
      border-color: var(--color-apple-blue);
      background: rgba(255, 255, 255, 0.06);
    }

    .forgot__submit {
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

    .forgot__submit:hover:not(:disabled) {
      background: var(--color-bright-blue);
    }

    .forgot__submit:active:not(:disabled) {
      transform: scale(0.98);
    }

    .forgot__submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .forgot__spinner {
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .forgot__divider {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin: var(--space-8) 0;
    }

    .forgot__divider::before,
    .forgot__divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
    }

    .forgot__divider span {
      font-size: var(--text-micro);
      color: var(--color-text-white-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .forgot__back {
      text-align: center;
      font-family: var(--font-body);
      font-size: var(--text-caption);
    }

    .forgot__back-link {
      color: var(--color-bright-blue);
      text-decoration: none;
      font-weight: var(--weight-medium);
      transition: opacity var(--duration-fast) var(--ease-default);
    }

    .forgot__back-link:hover {
      opacity: 0.8;
    }

    @media (max-width: 480px) {
      .forgot__card {
        padding: var(--space-8) var(--space-6);
      }

      .forgot__title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthService);

  email = '';
  isLoading = signal(false);
  isSent = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    if (!this.email) return;

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSent.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.message || 'Erreur lors de l\'envoi');
      }
    });
  }
}
