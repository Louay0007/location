// ═══════════════════════════════════════════════════════════════════════════
// FOOTER COMPONENT — Apple-Style Minimal Footer
// ═══════════════════════════════════════════════════════════════════════════

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer__container container">
        <div class="footer__grid">
          <div class="footer__brand">
            <a routerLink="/" class="footer__logo">
              <svg class="footer__logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                <circle cx="7" cy="17" r="2"></circle>
                <path d="M9 17h6"></path>
                <circle cx="17" cy="17" r="2"></circle>
              </svg>
              CarRental
            </a>
            <p class="footer__tagline">
              L'excellence de la location automobile premium en Tunisie. Expérience exclusive et service sur-mesure.
            </p>
          </div>

          <div class="footer__column">
            <h4 class="footer__heading">Navigation</h4>
            <nav class="footer__nav">
              <a routerLink="/" class="footer__link">Accueil</a>
              <a routerLink="/vehicles" class="footer__link">Véhicules</a>
              <a routerLink="/about" class="footer__link">À propos</a>
              <a routerLink="/contact" class="footer__link">Contact</a>
            </nav>
          </div>

          <div class="footer__column">
            <h4 class="footer__heading">Légal</h4>
            <nav class="footer__nav">
              <a routerLink="/terms" class="footer__link">Conditions d'utilisation</a>
              <a routerLink="/privacy" class="footer__link">Politique de confidentialité</a>
              <a routerLink="/cgv" class="footer__link">CGV</a>
            </nav>
          </div>

          <div class="footer__column">
            <h4 class="footer__heading">Contact</h4>
            <div class="footer__contact">
              <a href="mailto:contact&#64;carrental.tn" class="footer__link">contact&#64;carrental.tn</a>
              <a href="tel:+21612345678" class="footer__link">+216 12 345 678</a>
              <span class="footer__text">Ariana, Tunisie</span>
            </div>
          </div>
        </div>

        <div class="footer__bottom">
          <p class="footer__copyright">
            © {{ currentYear }} CarRental. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--color-pure-black);
      padding: var(--space-20) var(--space-6) var(--space-10);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .footer__container {
      max-width: var(--container-wide);
      margin: 0 auto;
    }

    .footer__grid {
      display: grid;
      grid-template-columns: 2.5fr 1fr 1fr 1.2fr;
      gap: var(--space-12);
      margin-bottom: var(--space-16);
    }

    .footer__brand {
      max-width: 320px;
    }

    .footer__logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: var(--weight-semibold);
      color: var(--color-white);
      text-decoration: none;
      margin-bottom: var(--space-6);
      transition: opacity var(--duration-fast) var(--ease-default);
      letter-spacing: -0.02em;
    }

    .footer__logo:hover {
      opacity: 0.8;
    }

    .footer__logo-icon {
      width: 28px;
      height: 28px;
      color: var(--color-apple-blue);
    }

    .footer__tagline {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      line-height: 1.6;
      color: var(--color-text-white-secondary);
      letter-spacing: -0.01em;
    }

    .footer__heading {
      font-family: var(--font-display);
      font-size: 0.8125rem;
      font-weight: var(--weight-semibold);
      color: var(--color-white);
      margin-bottom: var(--space-6);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .footer__nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .footer__link {
      font-family: var(--font-body);
      font-size: 0.875rem;
      color: var(--color-text-white-secondary);
      text-decoration: none;
      transition: color var(--duration-fast) var(--ease-default);
    }

    .footer__link:hover {
      color: var(--color-white);
    }

    .footer__contact {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .footer__text {
      font-size: 0.875rem;
      color: var(--color-text-white-tertiary);
    }

    .footer__bottom {
      padding-top: var(--space-10);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .footer__copyright {
      font-size: var(--text-micro);
      color: var(--color-text-white-tertiary);
      text-align: center;
      letter-spacing: 0.02em;
    }

    @media (max-width: 1024px) {
      .footer__grid {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-10);
      }
      .footer__brand {
        grid-column: 1 / -1;
        max-width: 100%;
      }
    }

    @media (max-width: 768px) {
      .footer {
        padding: var(--space-16) var(--space-4) var(--space-8);
      }

      .footer__grid {
        gap: var(--space-8);
      }

      .footer__tagline {
        font-size: 0.8125rem;
      }
    }

    @media (max-width: 480px) {
      .footer__grid {
        grid-template-columns: 1fr;
        gap: var(--space-8);
      }

      .footer {
        padding: var(--space-12) var(--space-4) var(--space-6);
      }

      .footer__logo {
        font-size: 1.125rem;
      }

      .footer__heading {
        font-size: 0.75rem;
        margin-bottom: var(--space-4);
      }

      .footer__bottom {
        padding-top: var(--space-6);
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
