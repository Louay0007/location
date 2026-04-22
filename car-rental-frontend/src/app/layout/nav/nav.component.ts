// ═════════════════════════════════════════════════════════════════════════════════════════
// NAVIGATION COMPONENT — Apple-Style Glass Navigation
// ═════════════════════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, computed, HostListener, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav" [class.nav--scrolled]="isScrolled()" [class.nav--open]="isMobileMenuOpen()">
      <div class="nav__container">
        <!-- Logo -->
        <a routerLink="/" class="nav__logo" (click)="closeMobileMenu()">
          <svg class="nav__logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
          <span class="nav__logo-text">CarRental</span>
        </a>

        <!-- Desktop Links -->
        <div class="nav__links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav__link">
            Accueil
          </a>
          <a routerLink="/vehicles" routerLinkActive="active" class="nav__link">
            Véhicules
          </a>
          <a routerLink="/about" routerLinkActive="active" class="nav__link">
            À propos
          </a>
          <a routerLink="/contact" routerLinkActive="active" class="nav__link">
            Contact
          </a>
        </div>

        <!-- Desktop Actions -->
        <div class="nav__actions">
          <!-- Theme Toggle -->
          <button class="nav__theme-toggle" (click)="toggleTheme()" [attr.aria-label]="isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'">
            @if (isDarkMode()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            }
          </button>

          @if (isAuthenticated()) {
            <a routerLink="/my-bookings" class="nav__action nav__action--secondary">
              Mes réservations
            </a>
            <div class="nav__user">
              <button class="nav__user-btn" (click)="toggleUserMenu()">
                <div class="nav__user-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span class="nav__user-name">{{ userName() }}</span>
                <svg class="nav__user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              @if (isUserMenuOpen()) {
                <div class="nav__user-menu">
                  <a routerLink="/profile" class="nav__user-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Mon profil
                  </a>
                  <a routerLink="/my-bookings" class="nav__user-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Mes réservations
                  </a>
                  @if (isAdmin()) {
                    <a routerLink="/admin" class="nav__user-menu-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                      Administration
                    </a>
                  }
                  <hr class="nav__user-menu-divider">
                  <button class="nav__user-menu-item nav__user-menu-item--danger" (click)="logout()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="nav__action nav__action--secondary">
              Connexion
            </a>
            <a routerLink="/auth/register" class="nav__action nav__action--primary">
              Inscription
            </a>
          }
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="nav__mobile-toggle" (click)="toggleMobileMenu()">
          @if (isMobileMenuOpen()) {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          }
        </button>
      </div>

      <!-- Mobile Menu -->
      @if (isMobileMenuOpen()) {
        <div class="nav__mobile-menu">
          <a routerLink="/" class="nav__mobile-link" (click)="closeMobileMenu()">
            Accueil
          </a>
          <a routerLink="/vehicles" class="nav__mobile-link" (click)="closeMobileMenu()">
            Véhicules
          </a>
          <a routerLink="/about" class="nav__mobile-link" (click)="closeMobileMenu()">
            À propos
          </a>
          <a routerLink="/contact" class="nav__mobile-link" (click)="closeMobileMenu()">
            Contact
          </a>
          <hr class="nav__mobile-divider">
          @if (isAuthenticated()) {
            <a routerLink="/my-bookings" class="nav__mobile-link" (click)="closeMobileMenu()">
              Mes réservations
            </a>
            <a routerLink="/profile" class="nav__mobile-link" (click)="closeMobileMenu()">
              Mon profil
            </a>
            <button class="nav__mobile-link nav__mobile-link--danger" (click)="logout()">
              Déconnexion
            </button>
          } @else {
            <a routerLink="/auth/login" class="nav__mobile-link" (click)="closeMobileMenu()">
              Connexion
            </a>
            <a routerLink="/auth/register" class="nav__mobile-link nav__mobile-link--primary" (click)="closeMobileMenu()">
              Inscription
            </a>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: var(--z-fixed);
      height: var(--nav-height);
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
      transition: background var(--duration-normal) var(--ease-default);
    }

    .nav--scrolled {
      background: rgba(0, 0, 0, 0.95);
    }

    :host-context([data-theme="light"]) .nav {
      background: #ffffff;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    :host-context([data-theme="light"]) .nav--scrolled {
      background: #ffffff;
    }

    .nav__container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      max-width: var(--container-wide);
      margin: 0 auto;
      padding: 0 var(--space-6);
    }

    .nav__logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
      color: var(--color-white);
      font-weight: var(--weight-semibold);
      font-size: 1.25rem;
      transition: opacity var(--duration-fast) var(--ease-default);
    }

    :host-context([data-theme="light"]) .nav__logo {
      color: var(--color-near-black);
    }

    .nav__logo:hover {
      opacity: 0.8;
    }

    .nav__logo-icon {
      width: 28px;
      height: 28px;
      color: var(--color-apple-blue);
    }

    .nav__logo-text {
      font-family: var(--font-display);
      letter-spacing: -0.02em;
    }

    .nav__links {
      display: none;
      gap: var(--space-8);
    }

    @media (min-width: 768px) {
      .nav__links {
        display: flex;
      }
    }

    .nav__link {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: var(--weight-medium);
      transition: color var(--duration-fast) var(--ease-default);
      letter-spacing: -0.01em;
    }

    :host-context([data-theme="light"]) .nav__link {
      color: rgba(0, 0, 0, 0.7);
    }

    .nav__link:hover,
    .nav__link.active {
      color: var(--color-white);
    }

    :host-context([data-theme="light"]) .nav__link:hover,
    :host-context([data-theme="light"]) .nav__link.active {
      color: var(--color-near-black);
    }

    .nav__actions {
      display: none;
      align-items: center;
      gap: var(--space-6);
    }

    @media (min-width: 768px) {
      .nav__actions {
        display: flex;
      }
    }

    .nav__action {
      padding: var(--space-2) var(--space-5);
      border-radius: var(--radius-pill);
      font-size: 0.8125rem;
      font-weight: var(--weight-medium);
      text-decoration: none;
      transition: all var(--duration-fast) var(--ease-default);
    }

    .nav__action--secondary {
      color: var(--color-white);
      background: transparent;
    }

    :host-context([data-theme="light"]) .nav__action--secondary {
      color: var(--color-near-black);
    }

    .nav__action--secondary:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    :host-context([data-theme="light"]) .nav__action--secondary:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .nav__action--primary {
      color: var(--color-white);
      background: var(--color-apple-blue);
    }

    .nav__action--primary:hover {
      background: var(--color-apple-blue-hover);
    }

    .nav__user {
      position: relative;
    }

    .nav__user-btn {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-1) var(--space-2);
      background: transparent;
      border: none;
      color: var(--color-white);
      cursor: pointer;
      border-radius: var(--radius-standard);
      transition: background var(--duration-fast) var(--ease-default);
    }

    :host-context([data-theme="light"]) .nav__user-btn {
      color: var(--color-near-black);
    }

    .nav__user-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    :host-context([data-theme="light"]) .nav__user-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .nav__user-avatar {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-dark-surface-2);
      border-radius: var(--radius-circle);
      color: var(--color-apple-blue);
      border: 1px solid var(--border-subtle);
    }

    :host-context([data-theme="light"]) .nav__user-avatar {
      background: var(--bg-secondary);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .nav__user-avatar svg {
      width: 18px;
      height: 18px;
    }

    .nav__user-name {
      font-size: 0.8125rem;
      font-weight: var(--weight-medium);
      display: none;
    }

    @media (min-width: 1024px) {
      .nav__user-name {
        display: block;
      }
    }

    .nav__user-chevron {
      width: 12px;
      height: 12px;
      opacity: 0.5;
    }

    .nav__user-menu {
      position: absolute;
      top: calc(100% + var(--space-3));
      right: 0;
      min-width: 220px;
      background: var(--color-dark-surface-1);
      border-radius: var(--radius-large);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      padding: var(--space-2);
      border: 1px solid var(--border-subtle);
      animation: fadeInScale var(--duration-fast) var(--ease-out);
    }

    :host-context([data-theme="light"]) .nav__user-menu {
      background: var(--bg-elevated);
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .nav__user-menu-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      color: var(--color-text-white-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      border-radius: var(--radius-standard);
      transition: all var(--duration-fast) var(--ease-default);
    }

    :host-context([data-theme="light"]) .nav__user-menu-item {
      color: var(--text-primary);
    }

    .nav__user-menu-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-white);
    }

    :host-context([data-theme="light"]) .nav__user-menu-item:hover {
      background: rgba(0, 0, 0, 0.05);
      color: var(--color-near-black);
    }

    .nav__user-menu-item svg {
      width: 18px;
      height: 18px;
      opacity: 0.7;
    }

    .nav__user-menu-item--danger {
      color: var(--color-error);
    }

    .nav__user-menu-divider {
      border: none;
      border-top: 1px solid var(--border-subtle);
      margin: var(--space-2);
    }

    .nav__mobile-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      color: var(--color-white);
      cursor: pointer;
    }

    :host-context([data-theme="light"]) .nav__mobile-toggle {
      color: var(--color-near-black);
    }

    @media (min-width: 768px) {
      .nav__mobile-toggle {
        display: none;
      }
    }

    .nav__mobile-toggle svg {
      width: 24px;
      height: 24px;
    }

    .nav__mobile-menu {
      position: absolute;
      top: var(--nav-height);
      left: 0;
      right: 0;
      background: var(--color-pure-black);
      padding: var(--space-6);
      height: calc(100vh - var(--nav-height));
      animation: slideDown var(--duration-normal) var(--ease-out);
    }

    :host-context([data-theme="light"]) .nav__mobile-menu {
      background: var(--bg-primary);
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .nav__mobile-link {
      display: block;
      padding: var(--space-4) 0;
      color: var(--color-white);
      text-decoration: none;
      font-size: 1.25rem;
      font-weight: var(--weight-semibold);
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    :host-context([data-theme="light"]) .nav__mobile-link {
      color: var(--color-near-black);
    }

    .nav__mobile-link--primary {
      color: var(--color-apple-blue);
    }

    .nav__mobile-divider {
      border: none;
      border-top: 1px solid var(--border-subtle);
      margin: var(--space-4) 0;
    }

    .nav__theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: none;
      color: var(--color-white);
      cursor: pointer;
      border-radius: var(--radius-circle);
      transition: background var(--duration-fast) var(--ease-default);
    }

    :host-context([data-theme="light"]) .nav__theme-toggle {
      color: var(--color-near-black);
    }

    .nav__theme-toggle:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    :host-context([data-theme="light"]) .nav__theme-toggle:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .nav__theme-toggle svg {
      width: 20px;
      height: 20px;
    }
  `]
})
export class NavComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeService = inject(ThemeService);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);
  isDarkMode = this.themeService.isDarkMode;

  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;
  userName = this.authService.fullName;

  userInitials = computed(() => {
    const user = this.authService.user();
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  ngOnInit(): void {
    if (this.isBrowser) {
      document.addEventListener('click', this.handleOutsideClick.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isBrowser) {
      this.isScrolled.set(window.scrollY > 10);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(open => !open);
    if (this.isBrowser) {
      if (this.isMobileMenuOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(open => !open);
  }

  logout(): void {
    this.authService.logout().subscribe();
    this.isUserMenuOpen.set(false);
    this.closeMobileMenu();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav__user')) {
      this.isUserMenuOpen.set(false);
    }
  }
}