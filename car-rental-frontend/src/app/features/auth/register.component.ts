// ═══════════════════════════════════════════════════════════════════════════
// REGISTER PAGE — Apple-Style Registration
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register">
      <div class="register__card">
        <div class="register__header">
          <h1 class="register__title">Inscription</h1>
          <p class="register__subtitle">Rejoignez l'expérience premium.</p>
        </div>

        @if (errorMessage()) {
          <div class="register__alert register__alert--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        @if (successMessage()) {
          <div class="register__alert register__alert--success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{{ successMessage() }}</span>
          </div>
        }

        <form class="register__form" (ngSubmit)="onSubmit()" #regForm="ngForm">
          <div class="register__row">
            <div class="register__field">
              <label class="register__label" for="firstName">Prénom</label>
              <div class="register__input-wrapper">
                <svg class="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  id="firstName"
                  type="text"
                  class="register__input"
                  placeholder="Prénom"
                  [(ngModel)]="firstName"
                  name="firstName"
                  required
                  autocomplete="given-name">
              </div>
            </div>

            <div class="register__field">
              <label class="register__label" for="lastName">Nom</label>
              <div class="register__input-wrapper">
                <svg class="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  id="lastName"
                  type="text"
                  class="register__input"
                  placeholder="Nom de famille"
                  [(ngModel)]="lastName"
                  name="lastName"
                  required
                  autocomplete="family-name">
              </div>
            </div>
          </div>

          <div class="register__field">
            <label class="register__label" for="email">Adresse email</label>
            <div class="register__input-wrapper">
              <svg class="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                id="email"
                type="email"
                class="register__input"
                placeholder="votre@email.com"
                [(ngModel)]="email"
                name="email"
                required
                email
                autocomplete="email">
            </div>
          </div>

          <div class="register__field">
            <label class="register__label" for="password">Mot de passe</label>
            <div class="register__input-wrapper">
              <svg class="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                class="register__input"
                placeholder="Minimum 8 caractères"
                [(ngModel)]="password"
                name="password"
                required
                minlength="8"
                autocomplete="new-password"
                (ngModelChange)="onPasswordInput()">
              <button type="button" class="register__toggle-password" (click)="showPassword.set(!showPassword())">
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
            @if (password) {
              <div class="register__strength">
                <div class="register__strength-bar">
                  <div class="register__strength-fill" [style.width.%]="passwordStrength().percent"
                       [class]="'register__strength-fill--' + passwordStrength().level"></div>
                </div>
                <span class="register__strength-text" [class]="'register__strength-text--' + passwordStrength().level">
                  {{ passwordStrength().label }}
                </span>
              </div>
            }
          </div>

          <button type="button" class="register__optional-toggle" (click)="showOptional.set(!showOptional())">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 [style.transform]="showOptional() ? 'rotate(180deg)' : 'rotate(0)'"
                 style="transition: transform 0.2s ease">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            Informations complémentaires (optionnel)
          </button>

          @if (showOptional()) {
            <div class="register__optional">
              <div class="register__field">
                <label class="register__label" for="phone">Téléphone</label>
                <div class="register__input-wrapper">
                  <svg class="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input
                    id="phone"
                    type="tel"
                    class="register__input"
                    placeholder="+216 XX XXX XXX"
                    [(ngModel)]="phone"
                    name="phone"
                    autocomplete="tel">
                </div>
              </div>

              <div class="register__row">
                <div class="register__field">
                  <label class="register__label" for="cin">CIN</label>
                  <div class="register__input-wrapper">
                    <svg class="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                      <line x1="2" y1="10" x2="22" y2="10"></line>
                    </svg>
                    <input
                      id="cin"
                      type="text"
                      class="register__input"
                      placeholder="Numéro CIN"
                      [(ngModel)]="cin"
                      name="cin">
                  </div>
                </div>

                <div class="register__field">
                  <label class="register__label" for="drivingLicense">Permis</label>
                  <div class="register__input-wrapper">
                    <svg class="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="M12 4v16"></path>
                      <path d="M2 12h20"></path>
                    </svg>
                    <input
                      id="drivingLicense"
                      type="text"
                      class="register__input"
                      placeholder="N° permis"
                      [(ngModel)]="drivingLicense"
                      name="drivingLicense">
                  </div>
                </div>
              </div>

              <div class="register__field">
                <label class="register__label" for="licenseExpiry">Expiration permis</label>
                <div class="register__input-wrapper">
                  <svg class="register__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input
                    id="licenseExpiry"
                    type="date"
                    class="register__input"
                    [(ngModel)]="licenseExpiry"
                    name="licenseExpiry">
                </div>
              </div>
            </div>
          }

          <button
            type="submit"
            class="register__submit"
            [disabled]="regForm.invalid || isLoading()">
            @if (isLoading()) {
              <svg class="register__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"></path>
              </svg>
            } @else {
              Créer mon compte
            }
          </button>
        </form>

        <div class="register__divider">
          <span>ou</span>
        </div>

        <p class="register__login">
          Déjà inscrit ?
          <a routerLink="/auth/login" class="register__login-link">Se connecter</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register {
      width: 100%;
    }

    .register__card {
      background: var(--bg-surface);
      border-radius: var(--radius-large);
      padding: var(--space-10);
      border: 1px solid var(--border-color);
    }

    .register__header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .register__title {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-2);
      letter-spacing: var(--tracking-tight);
    }

    .register__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      color: var(--text-secondary);
    }

    .register__alert {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-standard);
      font-size: var(--text-caption);
      margin-bottom: var(--space-6);
    }

    .register__alert--error {
      background: rgba(255, 59, 48, 0.1);
      color: var(--color-error);
      border: 1px solid rgba(255, 59, 48, 0.25);
    }

    .register__alert--success {
      background: rgba(52, 199, 89, 0.1);
      color: var(--color-success);
      border: 1px solid rgba(52, 199, 89, 0.25);
    }

    .register__alert svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .register__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .register__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .register__field {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .register__label {
      font-family: var(--font-body);
      font-size: var(--text-nano);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      color: var(--text-tertiary);
      letter-spacing: 0.05em;
    }

    .register__input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .register__input-icon {
      position: absolute;
      left: var(--space-4);
      width: 18px;
      height: 18px;
      color: var(--text-tertiary);
      pointer-events: none;
    }

    .register__input {
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

    .register__input::placeholder {
      color: var(--text-tertiary);
    }

    .register__input:focus {
      border-color: var(--color-apple-blue);
      background: var(--bg-secondary);
    }

    .register__toggle-password {
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

    .register__toggle-password svg {
      width: 18px;
      height: 18px;
    }

    .register__toggle-password:hover {
      color: var(--text-secondary);
    }

    .register__strength {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-2);
    }

    .register__strength-bar {
      flex: 1;
      height: 3px;
      background: var(--border-color);
      border-radius: 2px;
      overflow: hidden;
    }

    .register__strength-fill {
      height: 100%;
      border-radius: 2px;
      transition: width var(--duration-normal) var(--ease-default);
    }

    .register__strength-fill--weak { background: #ff3b30; }
    .register__strength-fill--fair { background: #ff9500; }
    .register__strength-fill--good { background: #ffcc00; }
    .register__strength-fill--strong { background: #34c759; }

    .register__strength-text {
      font-size: var(--text-micro);
      font-weight: var(--weight-medium);
      white-space: nowrap;
    }

    .register__strength-text--weak { color: #ff3b30; }
    .register__strength-text--fair { color: #ff9500; }
    .register__strength-text--good { color: #ffcc00; }
    .register__strength-text--strong { color: #34c759; }

    .register__optional-toggle {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: none;
      border: none;
      color: var(--text-secondary);
      font-family: var(--font-body);
      font-size: var(--text-caption);
      cursor: pointer;
      padding: var(--space-2) 0;
      transition: color var(--duration-fast) var(--ease-default);
    }

    .register__optional-toggle svg {
      width: 16px;
      height: 16px;
    }

    .register__optional-toggle:hover {
      color: var(--text-primary);
    }

    .register__optional {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .register__submit {
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
    }

    .register__submit:hover:not(:disabled) {
      background: var(--color-bright-blue);
    }

    .register__submit:active:not(:disabled) {
      transform: scale(0.98);
    }

    .register__submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .register__spinner {
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .register__divider {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin: var(--space-8) 0;
    }

    .register__divider::before,
    .register__divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border-color);
    }

    .register__divider span {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .register__login {
      text-align: center;
      font-family: var(--font-body);
      font-size: var(--text-caption);
      color: var(--text-secondary);
    }

    .register__login-link {
      color: var(--color-bright-blue);
      text-decoration: none;
      font-weight: var(--weight-medium);
      transition: opacity var(--duration-fast) var(--ease-default);
    }

    .register__login-link:hover {
      opacity: 0.8;
    }

    @media (max-width: 480px) {
      .register__card {
        padding: var(--space-8) var(--space-6);
      }

      .register__title {
        font-size: 1.5rem;
      }

      .register__row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phone = '';
  cin = '';
  drivingLicense = '';
  licenseExpiry = '';

  showPassword = signal(false);
  showOptional = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  passwordStrength = signal({ percent: 0, level: 'weak', label: 'Faible' });

  onPasswordInput(): void {
    this.updatePasswordStrength();
  }

  private updatePasswordStrength(): void {
    const p = this.password;
    if (!p) {
      this.passwordStrength.set({ percent: 0, level: 'weak', label: 'Faible' });
      return;
    }

    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    const levels = [
      { percent: 20, level: 'weak', label: 'Faible' },
      { percent: 40, level: 'fair', label: 'Moyen' },
      { percent: 60, level: 'fair', label: 'Moyen' },
      { percent: 80, level: 'good', label: 'Bon' },
      { percent: 100, level: 'strong', label: 'Fort' },
    ];

    this.passwordStrength.set(levels[Math.min(score, 4)]);
  }

  onSubmit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);
    this.updatePasswordStrength();

    this.auth.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phone: this.phone || undefined,
      cin: this.cin || undefined,
      drivingLicense: this.drivingLicense || undefined,
      licenseExpiry: this.licenseExpiry || undefined,
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(response.message || 'Compte créé avec succès. Vérifiez votre email.');
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        const serverError = err?.originalError?.message || err?.message;
        this.errorMessage.set(serverError || 'Erreur lors de l\'inscription');
      }
    });
  }
}
