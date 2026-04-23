// ═══════════════════════════════════════════════════════════════════════════
// NOT FOUND COMPONENT — 404 Page
// ═══════════════════════════════════════════════════════════════════════════

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found">
      <div class="not-found__container">
        <h1 class="not-found__title">404</h1>
        <p class="not-found__subtitle">Page non trouvée</p>
        <p class="not-found__description">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <a routerLink="/" class="not-found__home-link">
          Retour à l'accueil
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      padding: var(--space-6);
    }

    .not-found__container {
      text-align: center;
      max-width: 480px;
    }

    .not-found__title {
      font-family: var(--font-display);
      font-size: 8rem;
      font-weight: var(--weight-semibold);
      line-height: 1;
      color: var(--text-tertiary);
      margin-bottom: var(--space-4);
      letter-spacing: -0.05em;
    }

    .not-found__subtitle {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-3);
      letter-spacing: var(--tracking-tight);
    }

    .not-found__description {
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: var(--leading-body);
      color: var(--text-secondary);
      margin-bottom: var(--space-8);
    }

    .not-found__home-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-8);
      background: var(--color-apple-blue);
      color: #ffffff;
      text-decoration: none;
      font-size: var(--text-body);
      font-weight: var(--weight-medium);
      border-radius: var(--radius-pill);
      transition: background var(--duration-fast) var(--ease-default),
                  transform var(--duration-fast) var(--ease-default);
    }

    .not-found__home-link:hover {
      background: var(--color-apple-blue-hover);
      transform: translateY(-2px);
    }

    .not-found__home-link svg {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 640px) {
      .not-found__title {
        font-size: 6rem;
      }

      .not-found__subtitle {
        font-size: 2rem;
      }

      .not-found__home-link {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class NotFoundComponent {}
