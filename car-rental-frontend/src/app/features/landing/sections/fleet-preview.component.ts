// ═══════════════════════════════════════════════════════════════════════════
// FLEET PREVIEW COMPONENT — Featured Vehicles Carousel
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { Vehicle } from '../../../core/models';

@Component({
  selector: 'app-fleet-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="fleet-preview">
      <div class="container">
        <header class="fleet-preview__header">
          <h2 class="fleet-preview__title">Notre Flotte Premium</h2>
          <p class="fleet-preview__subtitle">
            Découvrez notre sélection de véhicules soigneusement choisis pour une expérience de conduite exceptionnelle.
          </p>
        </header>

        <div class="fleet-preview__carousel" (mouseenter)="pauseAutoplay()" (mouseleave)="startAutoplay()">
          <button 
            class="fleet-preview__nav fleet-preview__nav--prev" 
            [disabled]="currentIndex() === 0"
            (click)="prevSlide()"
            aria-label="Précédent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div class="fleet-preview__track" [style.transform]="'translateX(-' + (currentIndex() * 33.333) + '%)'">
            @for (vehicle of vehicles(); track vehicle.id) {
              <a 
                [routerLink]="['/vehicles', vehicle.id]"
                class="fleet-preview__card">
                <div class="fleet-preview__card-image">
                  <img 
                    [src]="vehicle.mainImageUrl || '/assets/images/placeholder-vehicle.jpg'" 
                    [alt]="vehicle.brand + ' ' + vehicle.model"
                    loading="lazy"
                  />
                  @if (vehicle.averageRating) {
                    <div class="fleet-preview__card-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <span>{{ vehicle.averageRating.toFixed(1) }}</span>
                    </div>
                  }
                </div>
                <div class="fleet-preview__card-content">
                  <h3 class="fleet-preview__card-title">{{ vehicle.brand }} {{ vehicle.model }}</h3>
                  <p class="fleet-preview__card-category">{{ vehicle.category | lowercase }}</p>
                  <div class="fleet-preview__card-meta">
                    <span class="fleet-preview__card-price">{{ vehicle.dailyRate }} TND/jour</span>
                    <span class="fleet-preview__card-cta">
                      Réserver
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            }
          </div>

          <button 
            class="fleet-preview__nav fleet-preview__nav--next" 
            [disabled]="currentIndex() >= vehicles().length - 3"
            (click)="nextSlide()"
            aria-label="Suivant">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        <div class="fleet-preview__dots">
          @for (i of dots(); track i) {
            <button 
              class="fleet-preview__dot"
              [class.fleet-preview__dot--active]="i === currentIndex()"
              (click)="goToSlide(i)"
              [attr.aria-label]="'Aller à la slide ' + (i + 1)">
            </button>
          }
        </div>

        <div class="fleet-preview__footer">
          <a [routerLink]="['/vehicles']" class="fleet-preview__view-all">
            Voir toute la flotte
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .fleet-preview {
      background: var(--bg-primary);
      padding: var(--space-24) var(--space-6);
      border-top: 1px solid var(--border-subtle);
      transition: background-color 0.3s ease;
    }

    :host-context([data-theme="light"]) .fleet-preview {
      background: #f5f5f7;
    }

    .fleet-preview__header {
      text-align: center;
      margin-bottom: var(--space-20);
    }

    .fleet-preview__title {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      line-height: var(--leading-section);
      color: var(--text-primary);
      margin-bottom: var(--space-4);
      letter-spacing: var(--tracking-tight);
    }

    .fleet-preview__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: var(--leading-body);
      color: var(--text-secondary);
      max-width: 640px;
      margin: 0 auto;
    }

    .fleet-preview__carousel {
      position: relative;
      max-width: var(--container-max);
      margin: 0 auto;
    }

    .fleet-preview__track {
      display: flex;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      gap: var(--space-6);
    }

    .fleet-preview__card {
      flex: 0 0 calc(33.333% - var(--space-4));
      background: var(--bg-elevated);
      border-radius: var(--radius-large);
      overflow: hidden;
      text-decoration: none;
      transition: transform var(--duration-normal) var(--ease-default),
                  box-shadow var(--duration-normal) var(--ease-default);
      cursor: pointer;
    }

    :host-context([data-theme="light"]) .fleet-preview__card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .fleet-preview__card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .fleet-preview__card-image {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 100%);
    }

    :host-context([data-theme="light"]) .fleet-preview__card-image {
      background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
    }

    .fleet-preview__card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .fleet-preview__card:hover .fleet-preview__card-image img {
      transform: scale(1.05);
    }

    .fleet-preview__card-badge {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-2);
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      border-radius: var(--radius-pill);
      font-size: var(--text-micro);
      font-weight: var(--weight-medium);
      color: #ffffff;
    }

    .fleet-preview__card-badge svg {
      width: 12px;
      height: 12px;
      color: #ffd700;
    }

    .fleet-preview__card-content {
      padding: var(--space-6);
    }

    .fleet-preview__card-title {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: var(--weight-semibold);
      line-height: 1.3;
      color: var(--text-primary);
      margin-bottom: var(--space-1);
      letter-spacing: var(--tracking-tile);
    }

    .fleet-preview__card-category {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      line-height: var(--leading-caption);
      color: var(--text-secondary);
      text-transform: capitalize;
      margin-bottom: var(--space-4);
    }

    .fleet-preview__card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .fleet-preview__card-price {
      font-family: var(--font-display);
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .fleet-preview__card-cta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-body);
      font-size: var(--text-link);
      font-weight: var(--weight-medium);
      color: var(--color-bright-blue);
      transition: gap var(--duration-fast) var(--ease-default);
    }

    .fleet-preview__card:hover .fleet-preview__card-cta {
      gap: var(--space-3);
    }

    .fleet-preview__card-cta svg {
      width: 14px;
      height: 14px;
    }

    .fleet-preview__nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: background var(--duration-fast) var(--ease-default),
                  transform var(--duration-fast) var(--ease-default);
      z-index: 10;
    }

    .fleet-preview__nav:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.9);
      transform: translateY(-50%) scale(1.1);
    }

    .fleet-preview__nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .fleet-preview__nav--prev {
      left: -22px;
    }

    .fleet-preview__nav--next {
      right: -22px;
    }

    .fleet-preview__nav svg {
      width: 20px;
      height: 20px;
      color: #ffffff;
    }

    .fleet-preview__dots {
      display: flex;
      justify-content: center;
      gap: var(--space-2);
      margin-top: var(--space-8);
    }

    .fleet-preview__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border-subtle);
      border: none;
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }

    :host-context([data-theme="light"]) .fleet-preview__dot {
      background: rgba(0, 0, 0, 0.2);
    }

    .fleet-preview__dot--active {
      background: var(--color-bright-blue);
      width: 24px;
      border-radius: var(--radius-pill);
    }

    .fleet-preview__footer {
      text-align: center;
      margin-top: var(--space-10);
    }

    .fleet-preview__view-all {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
      border: 1px solid var(--color-bright-blue);
      border-radius: 980px;
      font-family: var(--font-body);
      font-size: var(--text-body);
      font-weight: var(--weight-medium);
      color: var(--color-bright-blue);
      text-decoration: none;
      transition: background var(--duration-fast) var(--ease-default),
                  color var(--duration-fast) var(--ease-default);
    }

    .fleet-preview__view-all:hover {
      background: var(--color-bright-blue);
      color: #ffffff;
    }

    .fleet-preview__view-all svg {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 1024px) {
      .fleet-preview__card {
        flex: 0 0 calc(50% - var(--space-3));
      }

      .fleet-preview__nav--prev {
        left: 0;
      }

      .fleet-preview__nav--next {
        right: 0;
      }
    }

    @media (max-width: 768px) {
      .fleet-preview {
        padding: var(--space-16) var(--space-4);
      }

      .fleet-preview__header {
        margin-bottom: var(--space-12);
      }

      .fleet-preview__title {
        font-size: 1.75rem;
      }

      .fleet-preview__subtitle {
        font-size: 0.9375rem;
      }

      .fleet-preview__card {
        flex: 0 0 100%;
      }

      .fleet-preview__card-image {
        height: 180px;
      }

      .fleet-preview__nav {
        display: none;
      }

      .fleet-preview__dots {
        margin-top: var(--space-6);
      }
    }

    @media (max-width: 480px) {
      .fleet-preview {
        padding: var(--space-12) var(--space-4);
      }

      .fleet-preview__title {
        font-size: 1.5rem;
      }

      .fleet-preview__card-image {
        height: 160px;
      }

      .fleet-preview__card-content {
        padding: var(--space-5);
      }

      .fleet-preview__card-title {
        font-size: 1rem;
      }
    }
  `]
})
export class FleetPreviewComponent implements OnInit {
  private readonly vehiclesService = inject(VehiclesService);

  private readonly _vehicles = signal<Vehicle[]>([]);
  readonly vehicles = this._vehicles.asReadonly();

  private readonly _currentIndex = signal(0);
  readonly currentIndex = this._currentIndex.asReadonly();

  private autoplayInterval: any = null;

  ngOnInit(): void {
    this.loadFeaturedVehicles();
    this.startAutoplay();
  }

  private loadFeaturedVehicles(): void {
    this.vehiclesService.getVehicles({ limit: 6 }).subscribe({
      next: (vehicles) => {
        this._vehicles.set(vehicles);
      },
      error: () => {
        this._vehicles.set([]);
      }
    });
  }

  readonly dots = computed(() => {
    const count = Math.ceil(this.vehicles().length / 3);
    return Array.from({ length: count }, (_, i) => i);
  });

  nextSlide(): void {
    const maxIndex = Math.max(0, this.vehicles().length - 3);
    this._currentIndex.update(i => Math.min(i + 1, maxIndex));
  }

  prevSlide(): void {
    this._currentIndex.update(i => Math.max(i - 1, 0));
  }

  goToSlide(index: number): void {
    this._currentIndex.set(index);
  }

  startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      const maxIndex = Math.max(0, this.vehicles().length - 3);
      this._currentIndex.update(i => {
        const next = i + 1;
        return next > maxIndex ? 0 : next;
      });
    }, 5000);
  }

  pauseAutoplay(): void {
    this.stopAutoplay();
  }

  private stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}
