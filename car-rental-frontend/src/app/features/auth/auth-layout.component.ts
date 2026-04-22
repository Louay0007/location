// ═══════════════════════════════════════════════════════════════════════════
// AUTH LAYOUT — Shared layout for authentication pages
// ═══════════════════════════════════════════════════════════════════════════

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-layout">
      <div class="auth-layout__background">
        <div class="auth-layout__gradient"></div>
      </div>

      <div class="auth-layout__content">
        <a routerLink="/" class="auth-layout__logo">
          <svg class="auth-layout__logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
          <span class="auth-layout__logo-text">CarRental</span>
        </a>

        <main class="auth-layout__main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      position: relative;
      overflow: hidden;
    }

    .auth-layout__background {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .auth-layout__gradient {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 70% 30%, rgba(0, 113, 227, 0.08), transparent 50%),
        radial-gradient(circle at 30% 70%, rgba(0, 113, 227, 0.05), transparent 50%);
    }

    .auth-layout__content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
      padding: var(--space-8) var(--space-6);
    }

    .auth-layout__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      text-decoration: none;
      color: var(--text-primary);
      margin-bottom: var(--space-10);
      transition: opacity var(--duration-fast) var(--ease-default);
    }

    .auth-layout__logo:hover {
      opacity: 0.8;
    }

    .auth-layout__logo-icon {
      width: 32px;
      height: 32px;
      color: var(--color-apple-blue);
    }

    :host-context([data-theme="light"]) .auth-layout__gradient {
      background: none;
    }

    .auth-layout__logo-text {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: var(--weight-semibold);
      letter-spacing: -0.02em;
    }

    .auth-layout__main {
      width: 100%;
    }

    @media (max-width: 480px) {
      .auth-layout__content {
        padding: var(--space-6) var(--space-4);
      }

      .auth-layout__logo {
        margin-bottom: var(--space-8);
      }
    }
  `]
})
export class AuthLayoutComponent {}
