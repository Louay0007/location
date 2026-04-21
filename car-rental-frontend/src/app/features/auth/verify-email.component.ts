// ═══════════════════════════════════════════════════════════════════════════
// VERIFY EMAIL PAGE — Apple-Style Email Verification
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verify">
      <div class="verify__card">
        @if (isVerifying()) {
          <div class="verify__loading">
            <svg class="verify__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"></path>
            </svg>
            <p class="verify__loading-text">Vérification en cours...</p>
          </div>
        } @else if (isSuccess()) {
          <div class="verify__result">
            <div class="verify__icon-wrapper verify__icon-wrapper--success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 class="verify__title">Email vérifié</h1>
            <p class="verify__subtitle">
              Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.
            </p>
            <a routerLink="/auth/login" class="verify__btn">
              Se connecter
            </a>
          </div>
        } @else {
          <div class="verify__result">
            <div class="verify__icon-wrapper verify__icon-wrapper--error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h1 class="verify__title">Vérification échouée</h1>
            <p class="verify__subtitle">
              {{ errorMessage() || 'Le lien de vérification est invalide ou a expiré.' }}
            </p>
            <a routerLink="/auth/register" class="verify__btn verify__btn--secondary">
              Créer un nouveau compte
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .verify {
      width: 100%;
    }

    .verify__card {
      background: var(--color-dark-surface-1);
      border-radius: var(--radius-large);
      padding: var(--space-12) var(--space-10);
      border: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
    }

    .verify__loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-8) 0;
    }

    .verify__spinner {
      width: 40px;
      height: 40px;
      color: var(--color-apple-blue);
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .verify__loading-text {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      color: var(--color-text-white-secondary);
    }

    .verify__result {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }

    .verify__icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-large);
      background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .verify__icon-wrapper svg {
      width: 32px;
      height: 32px;
    }

    .verify__icon-wrapper--success {
      color: #34c759;
    }

    .verify__icon-wrapper--error {
      color: #ff3b30;
    }

    .verify__title {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: var(--weight-semibold);
      color: var(--color-white);
      letter-spacing: var(--tracking-tight);
    }

    .verify__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      color: var(--color-text-white-secondary);
      max-width: 360px;
      margin: 0 auto;
      line-height: var(--leading-caption);
    }

    .verify__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-3) var(--space-8);
      background: var(--color-apple-blue);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-pill);
      font-family: var(--font-body);
      font-size: var(--text-body);
      font-weight: var(--weight-medium);
      cursor: pointer;
      text-decoration: none;
      height: 48px;
      margin-top: var(--space-4);
      transition: background var(--duration-fast) var(--ease-default);
    }

    .verify__btn:hover {
      background: var(--color-bright-blue);
    }

    .verify__btn--secondary {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .verify__btn--secondary:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.4);
    }

    @media (max-width: 480px) {
      .verify__card {
        padding: var(--space-10) var(--space-6);
      }

      .verify__title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isVerifying = signal(true);
  isSuccess = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.isVerifying.set(false);
      this.errorMessage.set('Aucun token de vérification trouvé');
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: () => {
        this.isVerifying.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isVerifying.set(false);
        this.isSuccess.set(false);
        this.errorMessage.set(err?.message || 'Erreur de vérification');
      }
    });
  }
}
