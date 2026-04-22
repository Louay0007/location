// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES SECTION — Apple-Style Category Showcase (Dark Background)
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehiclesService } from '../../../core/services/vehicles.service';

interface VehicleCategory {
  icon: string;
  label: string;
  value: string;
  description: string;
  count: number;
  accent: string;
}

@Component({
  selector: 'app-categories-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="categories">
      <div class="container">
        <header class="categories__header">
          <h2 class="categories__title">Explorer la flotte</h2>
          <p class="categories__subtitle">
            Une sélection rigoureuse pour chaque profil de conducteur.
          </p>
        </header>

        <div class="categories__grid">
          @for (category of categories; track category.value) {
            <a
              [routerLink]="['/vehicles']"
              [queryParams]="{ category: category.value }"
              class="category-card">
              <div class="category-card__visual" [class]="'category-card__visual--' + category.accent">
                <div class="category-card__icon-ring">
                  <div class="category-card__icon" [innerHTML]="category.icon"></div>
                </div>
              </div>
              <div class="category-card__content">
                <h3 class="category-card__title">{{ category.label }}</h3>
                <p class="category-card__description">{{ category.description }}</p>
                <div class="category-card__meta">
                  <span class="category-card__count">{{ category.count }} véhicules</span>
                  <span class="category-card__cta">
                    Explorer
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .categories {
      background: var(--bg-primary);
      padding: var(--space-24) var(--space-6);
      border-top: 1px solid var(--border-subtle);
      transition: background-color 0.3s ease;
    }

    .categories__header {
      text-align: center;
      margin-bottom: var(--space-20);
    }

    .categories__title {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      line-height: var(--leading-section);
      color: var(--text-primary);
      margin-bottom: var(--space-4);
      letter-spacing: var(--tracking-tight);
    }

    .categories__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: var(--leading-body);
      color: var(--text-secondary);
      max-width: 560px;
      margin: 0 auto;
    }

    .categories__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
      max-width: var(--container-max);
      margin: 0 auto;
    }

    @media (max-width: 1024px) {
      .categories__grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .categories__grid {
        grid-template-columns: 1fr;
      }
    }

    .category-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-elevated);
      border-radius: var(--radius-large);
      overflow: hidden;
      text-decoration: none;
      transition: transform var(--duration-normal) var(--ease-default),
                  box-shadow var(--duration-normal) var(--ease-default);
    }

    :host-context([data-theme="light"]) .category-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .category-card__visual {
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .category-card__visual--blue,
    .category-card__visual--purple,
    .category-card__visual--green,
    .category-card__visual--orange,
    .category-card__visual--gold,
    .category-card__visual--teal {
      background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 100%);
    }

    :host-context([data-theme="light"]) .category-card__visual--blue,
    :host-context([data-theme="light"]) .category-card__visual--purple,
    :host-context([data-theme="light"]) .category-card__visual--green,
    :host-context([data-theme="light"]) .category-card__visual--orange,
    :host-context([data-theme="light"]) .category-card__visual--gold,
    :host-context([data-theme="light"]) .category-card__visual--teal {
      background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
    }

    .category-card__icon-ring {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-large);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-subtle);
    }

    :host-context([data-theme="light"]) .category-card__icon-ring {
      background: rgba(0, 0, 0, 0.03);
    }

    .category-card__icon ::ng-deep svg {
      width: 32px;
      height: 32px;
    }

    .category-card__visual--blue .category-card__icon { color: #4a90d9; }
    .category-card__visual--purple .category-card__icon { color: #7b68ae; }
    .category-card__visual--green .category-card__icon { color: #2d8a54; }
    .category-card__visual--orange .category-card__icon { color: #c47a2a; }
    .category-card__visual--gold .category-card__icon { color: #8a7a3a; }
    .category-card__visual--teal .category-card__icon { color: #4a9abf; }

    .category-card__content {
      flex: 1;
      padding: var(--space-6) var(--space-8) var(--space-8);
      background: var(--bg-elevated);
    }

    :host-context([data-theme="light"]) .category-card__content {
      background: #ffffff;
    }

    .category-card__title {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: var(--weight-semibold);
      line-height: 1.3;
      color: var(--text-primary);
      margin-bottom: var(--space-2);
      letter-spacing: var(--tracking-tile);
    }

    .category-card__description {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      line-height: var(--leading-caption);
      color: var(--text-secondary);
      margin-bottom: var(--space-6);
    }

    .category-card__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .category-card__count {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-pill);
      font-size: var(--text-micro);
      font-weight: var(--weight-medium);
      color: var(--text-tertiary);
      border: 1px solid var(--border-subtle);
    }

    :host-context([data-theme="light"]) .category-card__count {
      background: rgba(0, 0, 0, 0.03);
    }

    .category-card__cta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-body);
      font-size: var(--text-link);
      font-weight: var(--weight-medium);
      color: var(--color-bright-blue);
      transition: gap var(--duration-fast) var(--ease-default);
    }

    .category-card:hover .category-card__cta {
      gap: var(--space-3);
    }

    .category-card__cta svg {
      width: 14px;
      height: 14px;
    }

    @media (max-width: 768px) {
      .categories {
        padding: var(--space-16) var(--space-4);
      }

      .categories__header {
        margin-bottom: var(--space-12);
      }

      .categories__title {
        font-size: 1.75rem;
      }

      .categories__subtitle {
        font-size: 0.9375rem;
      }

      .category-card__visual {
        height: 90px;
      }

      .category-card__icon-ring {
        width: 52px;
        height: 52px;
      }

      .category-card__icon ::ng-deep svg {
        width: 26px;
        height: 26px;
      }

      .category-card__content {
        padding: var(--space-5) var(--space-6) var(--space-6);
      }

      .category-card__title {
        font-size: 1rem;
      }

      .category-card__description {
        font-size: 0.8125rem;
        margin-bottom: var(--space-4);
      }
    }

    @media (max-width: 480px) {
      .categories {
        padding: var(--space-12) var(--space-4);
      }

      .categories__title {
        font-size: 1.5rem;
      }

      .category-card__visual {
        height: 80px;
      }

      .category-card__icon-ring {
        width: 48px;
        height: 48px;
      }

      .category-card__icon ::ng-deep svg {
        width: 24px;
        height: 24px;
      }

      .category-card__meta {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
      }
    }
  `]
})
export class CategoriesSectionComponent implements OnInit {
  private readonly vehiclesService = inject(VehiclesService);

  private readonly _categoryCounts = signal<Record<string, number>>({});
  readonly categoryCounts = this._categoryCounts.asReadonly();

  categories: VehicleCategory[] = [
    { 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>', 
      label: 'Économique', 
      value: 'ECONOMY', 
      description: 'Efficacité et agilité pour vos déplacements urbains quotidiens.', 
      count: 0,
      accent: 'blue'
    },
    { 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>', 
      label: 'Compacte', 
      value: 'COMPACT', 
      description: 'L\'équilibre parfait entre confort et compacité pour la ville.', 
      count: 0,
      accent: 'purple'
    },
    { 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>', 
      label: 'Berline', 
      value: 'SEDAN', 
      description: 'Élégance et raffinement pour vos trajets professionnels ou personnels.', 
      count: 0,
      accent: 'green'
    },
    { 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="22" height="13" rx="2" ry="2"></rect><path d="M7 21h10"></path><path d="M12 16v5"></path></svg>', 
      label: 'SUV', 
      value: 'SUV', 
      description: 'Puissance et espace généreux pour toutes vos aventures en famille.', 
      count: 0,
      accent: 'orange'
    },
    { 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12L3 21l9-3 9 3-3-9"></path><path d="M12 3v15"></path></svg>', 
      label: 'Luxe', 
      value: 'LUXURY', 
      description: 'Le summum du prestige automobile pour une expérience inoubliable.', 
      count: 0,
      accent: 'gold'
    },
    { 
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 8h10"></path><path d="M7 12h10"></path><path d="M7 16h10"></path></svg>', 
      label: 'Van', 
      value: 'VAN', 
      description: 'Capacité et modularité pour vos déplacements en groupe sans compromis.', 
      count: 0,
      accent: 'teal'
    }
  ];

  ngOnInit(): void {
    this.vehiclesService.getCategoryCounts().subscribe({
      next: (counts) => {
        const countMap: Record<string, number> = {};
        counts.forEach(c => countMap[c.category] = c.count);
        this._categoryCounts.set(countMap);
        // Update categories with real counts
        this.categories = this.categories.map(cat => ({
          ...cat,
          count: countMap[cat.value] ?? 0
        }));
      },
      error: () => {
        // Fallback: keep default counts of 0
      }
    });
  }
}

