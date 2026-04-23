// ═══════════════════════════════════════════════════════════════════════════
// TESTIMONIALS COMPONENT — Client Reviews Carousel
// ═══════════════════════════════════════════════════════════════════════════

import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="testimonials">
      <div class="container">
        <header class="testimonials__header">
          <h2 class="testimonials__title">Ce que disent nos clients</h2>
          <p class="testimonials__subtitle">
            Des milliers de conducteurs nous font confiance pour leurs déplacements.
          </p>
        </header>

        <div class="testimonials__carousel" (mouseenter)="pauseAutoplay()" (mouseleave)="startAutoplay()">
          <button 
            class="testimonials__nav testimonials__nav--prev" 
            [disabled]="currentIndex() === 0"
            (click)="prevSlide()"
            aria-label="Précédent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div class="testimonials__track" [style.transform]="'translateX(-' + (currentIndex() * 33.333) + '%)'">
            @for (testimonial of testimonials(); track testimonial.name) {
              <article class="testimonial-card">
                <div class="testimonial-card__header">
                  <div class="testimonial-card__avatar">
                    <img [src]="testimonial.avatar" [alt]="testimonial.name" loading="lazy" />
                  </div>
                  <div class="testimonial-card__info">
                    <h3 class="testimonial-card__name">{{ testimonial.name }}</h3>
                    <p class="testimonial-card__role">{{ testimonial.role }}</p>
                  </div>
                  <div class="testimonial-card__rating">
                    @for (i of [1, 2, 3, 4, 5]; track i) {
                      <svg 
                        class="testimonial-card__star"
                        [class.testimonial-card__star--filled]="i <= testimonial.rating"
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        stroke="currentColor" 
                        stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    }
                  </div>
                </div>
                <blockquote class="testimonial-card__text">
                  "{{ testimonial.text }}"
                </blockquote>
                <p class="testimonial-card__date">{{ testimonial.date }}</p>
              </article>
            }
          </div>

          <button 
            class="testimonials__nav testimonials__nav--next" 
            [disabled]="currentIndex() >= testimonials().length - 3"
            (click)="nextSlide()"
            aria-label="Suivant">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        <div class="testimonials__dots">
          @for (i of dots(); track i) {
            <button 
              class="testimonials__dot"
              [class.testimonials__dot--active]="i === currentIndex()"
              (click)="goToSlide(i)"
              [attr.aria-label]="'Aller au témoignage ' + (i + 1)">
            </button>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .testimonials {
      background: var(--bg-primary);
      padding: var(--space-24) var(--space-6);
      border-top: 1px solid var(--border-subtle);
      transition: background-color 0.3s ease;
    }

    :host-context([data-theme="light"]) .testimonials {
      background: #000000;
    }

    .testimonials__header {
      text-align: center;
      margin-bottom: var(--space-20);
    }

    .testimonials__title {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      line-height: var(--leading-section);
      color: var(--text-primary);
      margin-bottom: var(--space-4);
      letter-spacing: var(--tracking-tight);
    }

    .testimonials__subtitle {
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: var(--leading-body);
      color: var(--text-secondary);
      max-width: 560px;
      margin: 0 auto;
    }

    .testimonials__carousel {
      position: relative;
      max-width: var(--container-max);
      margin: 0 auto;
    }

    .testimonials__track {
      display: flex;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      gap: var(--space-6);
    }

    .testimonial-card {
      flex: 0 0 calc(33.333% - var(--space-4));
      background: var(--bg-elevated);
      border-radius: var(--radius-large);
      padding: var(--space-8);
      transition: transform var(--duration-normal) var(--ease-default),
                  box-shadow var(--duration-normal) var(--ease-default);
    }

    :host-context([data-theme="light"]) .testimonial-card {
      background: #1d1d1f;
    }

    .testimonial-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .testimonial-card__header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .testimonial-card__avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 100%);
    }

    :host-context([data-theme="light"]) .testimonial-card__avatar {
      background: linear-gradient(135deg, #2a2a2d 0%, #3a3a3d 100%);
    }

    .testimonial-card__avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .testimonial-card__info {
      flex: 1;
    }

    .testimonial-card__name {
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: var(--weight-semibold);
      line-height: 1.3;
      color: var(--text-primary);
      margin-bottom: var(--space-1);
      letter-spacing: var(--tracking-tile);
    }

    .testimonial-card__role {
      font-family: var(--font-body);
      font-size: var(--text-caption);
      line-height: var(--leading-caption);
      color: var(--text-secondary);
    }

    .testimonial-card__rating {
      display: flex;
      gap: var(--space-1);
    }

    .testimonial-card__star {
      width: 16px;
      height: 16px;
      color: var(--border-subtle);
    }

    :host-context([data-theme="light"]) .testimonial-card__star {
      color: rgba(255, 255, 255, 0.3);
    }

    .testimonial-card__star--filled {
      color: #ffd700;
    }

    .testimonial-card__text {
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: var(--leading-body);
      color: var(--text-primary);
      margin-bottom: var(--space-4);
      font-style: italic;
    }

    .testimonial-card__date {
      font-family: var(--font-body);
      font-size: var(--text-micro);
      line-height: var(--leading-micro);
      color: var(--text-tertiary);
    }

    .testimonials__nav {
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

    .testimonials__nav:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.9);
      transform: translateY(-50%) scale(1.1);
    }

    .testimonials__nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .testimonials__nav--prev {
      left: -22px;
    }

    .testimonials__nav--next {
      right: -22px;
    }

    .testimonials__nav svg {
      width: 20px;
      height: 20px;
      color: #ffffff;
    }

    .testimonials__dots {
      display: flex;
      justify-content: center;
      gap: var(--space-2);
      margin-top: var(--space-8);
    }

    .testimonials__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border-subtle);
      border: none;
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }

    :host-context([data-theme="light"]) .testimonials__dot {
      background: rgba(255, 255, 255, 0.3);
    }

    .testimonials__dot--active {
      background: var(--color-bright-blue);
      width: 24px;
      border-radius: var(--radius-pill);
    }

    @media (max-width: 1024px) {
      .testimonial-card {
        flex: 0 0 calc(50% - var(--space-3));
      }

      .testimonials__nav--prev {
        left: 0;
      }

      .testimonials__nav--next {
        right: 0;
      }
    }

    @media (max-width: 768px) {
      .testimonials {
        padding: var(--space-16) var(--space-4);
      }

      .testimonials__header {
        margin-bottom: var(--space-12);
      }

      .testimonials__title {
        font-size: 1.75rem;
      }

      .testimonials__subtitle {
        font-size: 0.9375rem;
      }

      .testimonial-card {
        flex: 0 0 100%;
        padding: var(--space-6);
      }

      .testimonial-card__avatar {
        width: 48px;
        height: 48px;
      }

      .testimonial-card__name {
        font-size: 0.9375rem;
      }

      .testimonial-card__role {
        font-size: 0.8125rem;
      }

      .testimonial-card__text {
        font-size: 0.9375rem;
      }

      .testimonials__nav {
        display: none;
      }

      .testimonials__dots {
        margin-top: var(--space-6);
      }
    }

    @media (max-width: 480px) {
      .testimonials {
        padding: var(--space-12) var(--space-4);
      }

      .testimonials__title {
        font-size: 1.5rem;
      }

      .testimonial-card__header {
        gap: var(--space-3);
      }

      .testimonial-card__avatar {
        width: 44px;
        height: 44px;
      }
    }
  `]
})
export class TestimonialsComponent implements OnInit {
  private readonly _testimonials = signal<Testimonial[]>([
    {
      name: 'Ahmed Benali',
      role: 'Entrepreneur',
      avatar: '/assets/images/avatar-1.jpg',
      rating: 5,
      text: 'Service impeccable. La voiture était propre, récente et le processus de location était fluide. Je recommande vivement cette plateforme.',
      date: 'Il y a 2 semaines'
    },
    {
      name: 'Sarah Mounir',
      role: 'Consultante',
      avatar: '/assets/images/avatar-2.jpg',
      rating: 5,
      text: 'Une expérience exceptionnelle du début à la fin. Le personnel est professionnel et les véhicules sont de première qualité.',
      date: 'Il y a 1 mois'
    },
    {
      name: 'Karim Tounsi',
      role: 'Ingénieur',
      avatar: '/assets/images/avatar-3.jpg',
      rating: 4,
      text: 'Très bon rapport qualité-prix. La réservation en ligne est simple et rapide. Petite suggestion: améliorer le suivi par email.',
      date: 'Il y a 3 semaines'
    },
    {
      name: 'Fatma Zerrouki',
      role: 'Médecin',
      avatar: '/assets/images/avatar-4.jpg',
      rating: 5,
      text: 'Location sans surprise. Le véhicule correspondait exactement à la description. Service client réactif et courtois.',
      date: 'Il y a 2 mois'
    },
    {
      name: 'Mohamed Kacem',
      role: 'Directeur Commercial',
      avatar: '/assets/images/avatar-5.jpg',
      rating: 5,
      text: 'Idéal pour mes déplacements professionnels. Flotte variée et toujours disponible. Mon partenaire de confiance.',
      date: 'Il y a 1 mois'
    },
    {
      name: 'Leila Haddad',
      role: 'Architecte',
      avatar: '/assets/images/avatar-6.jpg',
      rating: 4,
      text: 'Excellente alternative à l\'achat. J\'apprécie la flexibilité des tarifs et la transparence des coûts.',
      date: 'Il y a 3 semaines'
    }
  ]);
  readonly testimonials = this._testimonials.asReadonly();

  private readonly _currentIndex = signal(0);
  readonly currentIndex = this._currentIndex.asReadonly();

  private autoplayInterval: any = null;

  ngOnInit(): void {
    this.startAutoplay();
  }

  readonly dots = computed(() => {
    const count = Math.ceil(this.testimonials().length / 3);
    return Array.from({ length: count }, (_, i) => i);
  });

  nextSlide(): void {
    const maxIndex = Math.max(0, this.testimonials().length - 3);
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
      const maxIndex = Math.max(0, this.testimonials().length - 3);
      this._currentIndex.update(i => {
        const next = i + 1;
        return next > maxIndex ? 0 : next;
      });
    }, 6000);
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
