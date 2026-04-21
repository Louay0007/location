// ═══════════════════════════════════════════════════════════════════════════
// FEATURES SECTION — Apple-Style Feature Grid (Light Background)
// ═══════════════════════════════════════════════════════════════════════════

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
  accent: string;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="features">
      <div class="container">
        <header class="features__header">
          <h2 class="features__title">L'excellence de la location</h2>
          <p class="features__subtitle">
            Une expérience premium pensée dans les moindres détails.
          </p>
        </header>

        <div class="features__grid">
          @for (feature of features; track feature.title) {
            <article class="feature-card">
              <div class="feature-card__visual" [class]="'feature-card__visual--' + feature.accent">
                <div class="feature-card__icon-ring">
                  <div class="feature-card__icon" [innerHTML]="feature.icon"></div>
                </div>
              </div>
              <div class="feature-card__body">
                <h3 class="feature-card__title">{{ feature.title }}</h3>
                <p class="feature-card__description">{{ feature.description }}</p>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .features {
      background: var(--color-pure-black);
      padding: var(--space-24) var(--space-6);
    }

    .features__header {
      text-align: center;
      margin-bottom: var(--space-20);
    }

    .features__title {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      line-height: var(--leading-section);
      color: var(--color-white);
      margin-bottom: var(--space-4);
      letter-spacing: var(--tracking-tight);
    }

    .features__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: var(--leading-body);
      color: var(--color-text-white-secondary);
      max-width: 500px;
      margin: 0 auto;
    }

    .features__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
      max-width: var(--container-max);
      margin: 0 auto;
    }

    @media (max-width: 1024px) {
      .features__grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .features__grid {
        grid-template-columns: 1fr;
      }
    }

    .feature-card {
      background: var(--color-dark-surface-1);
      border-radius: var(--radius-large);
      overflow: hidden;
      transition: transform var(--duration-normal) var(--ease-default),
                  box-shadow var(--duration-normal) var(--ease-default);
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .feature-card__visual {
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .feature-card__visual--blue,
    .feature-card__visual--purple,
    .feature-card__visual--green,
    .feature-card__visual--orange,
    .feature-card__visual--red,
    .feature-card__visual--teal {
      background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 100%);
    }

    .feature-card__icon-ring {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-large);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
    }

    .feature-card__icon ::ng-deep svg {
      width: 40px;
      height: 40px;
    }

    .feature-card__visual--blue .feature-card__icon { color: #4a90d9; }
    .feature-card__visual--purple .feature-card__icon { color: #7b68ae; }
    .feature-card__visual--green .feature-card__icon { color: #2d8a54; }
    .feature-card__visual--orange .feature-card__icon { color: #c47a2a; }
    .feature-card__visual--red .feature-card__icon { color: #a83a32; }
    .feature-card__visual--teal .feature-card__icon { color: #4a9abf; }

    .feature-card__body {
      padding: var(--space-8) var(--space-8) var(--space-10);
    }

    .feature-card__title {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: var(--weight-semibold);
      line-height: 1.3;
      color: var(--color-white);
      margin-bottom: var(--space-3);
      letter-spacing: var(--tracking-tile);
    }

    .feature-card__description {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      line-height: var(--leading-caption);
      color: var(--color-text-white-secondary);
      letter-spacing: var(--tracking-link);
    }

    @media (max-width: 768px) {
      .features {
        padding: var(--space-16) var(--space-4);
      }

      .features__header {
        margin-bottom: var(--space-12);
      }

      .features__title {
        font-size: 1.75rem;
      }

      .features__subtitle {
        font-size: 0.9375rem;
      }

      .feature-card__visual {
        height: 120px;
      }

      .feature-card__icon-ring {
        width: 64px;
        height: 64px;
      }

      .feature-card__icon ::ng-deep svg {
        width: 32px;
        height: 32px;
      }

      .feature-card__body {
        padding: var(--space-6) var(--space-6) var(--space-8);
      }

      .feature-card__title {
        font-size: 1rem;
      }

      .feature-card__description {
        font-size: 0.8125rem;
      }
    }

    @media (max-width: 480px) {
      .features {
        padding: var(--space-12) var(--space-4);
      }

      .features__title {
        font-size: 1.5rem;
      }

      .feature-card__visual {
        height: 100px;
      }

      .feature-card__icon-ring {
        width: 56px;
        height: 56px;
      }

      .feature-card__icon ::ng-deep svg {
        width: 28px;
        height: 28px;
      }
    }
  `]
})
export class FeaturesSectionComponent {
  features: Feature[] = [
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
      title: 'Flotte Premium',
      description: 'Sélection rigoureuse de véhicules de luxe et sportifs pour une conduite d\'exception.',
      accent: 'blue'
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>',
      title: 'Réservation Instantanée',
      description: 'Technologie de pointe pour une confirmation en temps réel sans attente.',
      accent: 'purple'
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
      title: 'Paiement Sécurisé',
      description: 'Encryption de bout en bout pour des transactions confidentielles et sécurisées.',
      accent: 'green'
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
      title: 'Localisation Flexible',
      description: 'Points de retrait stratégiques ou livraison directe à votre emplacement.',
      accent: 'orange'
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      title: 'Assurance Complète',
      description: 'Tranquillité d\'esprit totale avec nos couvertures premium tout inclus.',
      accent: 'red'
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.5 8.5 0 0 1 7.6 11.7z"></path></svg>',
      title: 'Conciergerie 24/7',
      description: 'Assistance personnalisée à toute heure pour répondre à chacune de vos exigences.',
      accent: 'teal'
    }
  ];
}

