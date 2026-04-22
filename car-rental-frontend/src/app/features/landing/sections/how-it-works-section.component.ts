// ═══════════════════════════════════════════════════════════════════════════
// HOW IT WORKS SECTION — Apple-Style Process Steps (Light Background)
// ═══════════════════════════════════════════════════════════════════════════

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
}

@Component({
  selector: 'app-how-it-works-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="how-it-works">
      <div class="container">
        <header class="how-it-works__header">
          <h2 class="how-it-works__title">Simplicité absolue</h2>
          <p class="how-it-works__subtitle">
            Louez votre véhicule en trois étapes fluides.
          </p>
        </header>

        <div class="how-it-works__steps">
          @for (step of steps; track step.number; let i = $index) {
            <article class="step">
              <div class="step__visual" [class]="'step__visual--' + step.accent">
                <div class="step__icon-ring">
                  <div class="step__icon" [innerHTML]="step.icon"></div>
                </div>
                <span class="step__number">{{ step.number }}</span>
              </div>
              <div class="step__content">
                <h3 class="step__title">{{ step.title }}</h3>
                <p class="step__description">{{ step.description }}</p>
              </div>
              @if (i < steps.length - 1) {
                <div class="step__connector">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              }
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .how-it-works {
      background: var(--bg-primary);
      padding: var(--space-24) var(--space-6);
      border-top: 1px solid var(--border-subtle);
      transition: background-color 0.3s ease;
    }

    .how-it-works__header {
      text-align: center;
      margin-bottom: var(--space-20);
    }

    .how-it-works__title {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      line-height: var(--leading-section);
      color: var(--text-primary);
      margin-bottom: var(--space-4);
      letter-spacing: var(--tracking-tight);
    }

    .how-it-works__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: var(--leading-body);
      color: var(--text-secondary);
      max-width: 500px;
      margin: 0 auto;
    }

    .how-it-works__steps {
      display: flex;
      align-items: stretch;
      justify-content: center;
      gap: var(--space-8);
      max-width: var(--container-max);
      margin: 0 auto;
    }

    .step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 380px;
      position: relative;
      background: var(--bg-elevated);
      border-radius: var(--radius-large);
      overflow: hidden;
      transition: transform var(--duration-normal) var(--ease-default),
                  box-shadow var(--duration-normal) var(--ease-default);
    }

    :host-context([data-theme="light"]) .step {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .step:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .step__visual {
      width: 100%;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .step__visual--blue,
    .step__visual--purple,
    .step__visual--green {
      background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 100%);
    }

    :host-context([data-theme="light"]) .step__visual--blue,
    :host-context([data-theme="light"]) .step__visual--purple,
    :host-context([data-theme="light"]) .step__visual--green {
      background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
    }

    .step__icon-ring {
      width: 72px;
      height: 72px;
      border-radius: var(--radius-large);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-subtle);
    }

    :host-context([data-theme="light"]) .step__icon-ring {
      background: rgba(0, 0, 0, 0.03);
    }

    .step__icon ::ng-deep svg {
      width: 36px;
      height: 36px;
    }

    .step__visual--blue .step__icon { color: #4a90d9; }
    .step__visual--purple .step__icon { color: #7b68ae; }
    .step__visual--green .step__icon { color: #2d8a54; }

    .step__number {
      position: absolute;
      top: var(--space-3);
      right: var(--space-4);
      font-family: var(--font-display);
      font-size: 3rem;
      font-weight: var(--weight-bold);
      color: rgba(255, 255, 255, 0.04);
      line-height: 1;
    }

    :host-context([data-theme="light"]) .step__number {
      color: rgba(0, 0, 0, 0.06);
    }

    .step__content {
      padding: var(--space-8) var(--space-8) var(--space-10);
      background: var(--bg-elevated);
    }

    :host-context([data-theme="light"]) .step__content {
      background: #ffffff;
    }

    .step__title {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: var(--weight-semibold);
      line-height: 1.3;
      color: var(--text-primary);
      margin-bottom: var(--space-3);
      letter-spacing: var(--tracking-tile);
    }

    .step__description {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      line-height: var(--leading-caption);
      color: var(--text-secondary);
      letter-spacing: var(--tracking-link);
    }

    .step__connector {
      position: absolute;
      right: -38px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--border-subtle);
      z-index: 1;
    }

    .step__connector svg {
      width: 24px;
      height: 24px;
    }

    @media (max-width: 1024px) {
      .step__connector {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .how-it-works {
        padding: var(--space-16) var(--space-4);
      }

      .how-it-works__header {
        margin-bottom: var(--space-12);
      }

      .how-it-works__title {
        font-size: 1.75rem;
      }

      .how-it-works__subtitle {
        font-size: 0.9375rem;
      }

      .how-it-works__steps {
        flex-direction: column;
        align-items: center;
        gap: var(--space-6);
      }

      .step {
        max-width: 100%;
        width: 100%;
      }

      .step__visual {
        height: 110px;
      }

      .step__icon-ring {
        width: 60px;
        height: 60px;
      }

      .step__icon ::ng-deep svg {
        width: 30px;
        height: 30px;
      }

      .step__content {
        padding: var(--space-6) var(--space-6) var(--space-8);
      }

      .step__title {
        font-size: 1rem;
      }

      .step__description {
        font-size: 0.8125rem;
      }
    }

    @media (max-width: 480px) {
      .how-it-works {
        padding: var(--space-12) var(--space-4);
      }

      .how-it-works__title {
        font-size: 1.5rem;
      }

      .step__visual {
        height: 90px;
      }

      .step__icon-ring {
        width: 52px;
        height: 52px;
      }

      .step__icon ::ng-deep svg {
        width: 26px;
        height: 26px;
      }

      .step__number {
        font-size: 2.5rem;
      }
    }
  `]
})
export class HowItWorksSectionComponent {
  steps: Step[] = [
    {
      number: '1',
      title: 'Sélection',
      description: 'Explorez notre catalogue exclusif et trouvez le véhicule parfaitement adapté à vos exigences.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      accent: 'blue'
    },
    {
      number: '2',
      title: 'Réservation',
      description: 'Planifiez vos dates et finalisez votre location en quelques secondes grâce à notre interface intuitive.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      accent: 'purple'
    },
    {
      number: '3',
      title: 'Expérience',
      description: 'Prenez possession de votre véhicule et profitez d\'une conduite d\'exception sur toutes les routes.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8l4 4-4 4M8 12h7"></path></svg>',
      accent: 'green'
    }
  ];
}
