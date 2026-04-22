// ═══════════════════════════════════════════════════════════════════════════
// CTA SECTION — Apple-Style Call-to-Action (Dark Background)
// ═══════════════════════════════════════════════════════════════════════════

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="cta">
      <div class="cta__background">
        <div class="cta__glow"></div>
      </div>
      <div class="cta__content container">
        <h2 class="cta__title">L'expérience commence ici.</h2>
        <p class="cta__subtitle">
          Rejoignez le cercle exclusif de nos clients et profitez d'un service de location sans égal.
        </p>
        <div class="cta__actions">
          <a routerLink="/vehicles" class="cta__btn cta__btn--primary">
            Découvrir la flotte
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a routerLink="/auth/register" class="cta__btn cta__btn--secondary">
            Créer un compte
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .cta {
      position: relative;
      background: var(--bg-primary);
      padding: var(--space-32) var(--space-6);
      overflow: hidden;
      border-top: 1px solid var(--border-subtle);
      transition: background-color 0.3s ease;
    }

    .cta__background {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .cta__glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60%;
      height: 60%;
      background: radial-gradient(circle, rgba(0, 113, 227, 0.12) 0%, transparent 70%);
      filter: blur(60px);
    }

    .cta__content {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .cta__title {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: var(--weight-bold);
      line-height: 1.1;
      color: var(--text-primary);
      margin-bottom: var(--space-6);
      letter-spacing: -0.03em;
    }

    .cta__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-subheading);
      line-height: var(--leading-body);
      color: var(--text-secondary);
      margin-bottom: var(--space-12);
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta__actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-6);
    }

    .cta__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-8);
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: var(--weight-medium);
      text-decoration: none;
      border-radius: var(--radius-pill);
      transition: all var(--duration-fast) var(--ease-default);
    }

    .cta__btn--primary {
      background: var(--color-apple-blue);
      color: var(--color-white);
    }

    .cta__btn--primary:hover {
      background: var(--color-apple-blue-hover);
      transform: scale(1.02);
    }

    .cta__btn--primary svg {
      width: 18px;
      height: 18px;
      transition: transform var(--duration-fast) var(--ease-default);
    }

    .cta__btn--primary:hover svg {
      transform: translateX(4px);
    }

    .cta__btn--secondary {
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
    }

    .cta__btn--secondary:hover {
      background: var(--hover-bg);
      border-color: var(--border-color);
    }

    @media (max-width: 768px) {
      .cta {
        padding: var(--space-20) var(--space-4);
      }

      .cta__title {
        font-size: clamp(1.75rem, 5vw, 2.5rem);
      }

      .cta__subtitle {
        font-size: 1rem;
        margin-bottom: var(--space-8);
      }

      .cta__actions {
        flex-direction: column;
        gap: var(--space-4);
      }

      .cta__btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .cta {
        padding: var(--space-16) var(--space-4);
      }

      .cta__title {
        font-size: 1.5rem;
      }

      .cta__subtitle {
        font-size: 0.9375rem;
      }
    }
  `]
})
export class CtaSectionComponent {}
