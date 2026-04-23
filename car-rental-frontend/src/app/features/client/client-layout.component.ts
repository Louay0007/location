// ═══════════════════════════════════════════════════════════════════════════
// CLIENT LAYOUT — Dashboard Shell
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="client-layout">
      <aside class="client-layout__sidebar">
        <div class="client-layout__user">
          <div class="client-layout__avatar">
            @if (authService.user()?.avatarUrl) {
              <img [src]="authService.user()!.avatarUrl" [alt]="authService.fullName()" />
            } @else {
              <span class="client-layout__avatar-initials">{{ getInitials() }}</span>
            }
          </div>
          <div class="client-layout__user-info">
            <span class="client-layout__user-name">{{ authService.fullName() }}</span>
            <span class="client-layout__user-email">{{ authService.user()?.email }}</span>
          </div>
        </div>

        <nav class="client-layout__nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="client-layout__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            <span>Tableau de bord</span>
          </a>
          <a routerLink="/dashboard/bookings" routerLinkActive="active" class="client-layout__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Mes réservations</span>
          </a>
          <a routerLink="/dashboard/profile" routerLinkActive="active" class="client-layout__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Mon profil</span>
          </a>
          <a routerLink="/dashboard/notifications" routerLinkActive="active" class="client-layout__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Notifications</span>
          </a>
        </nav>

        <div class="client-layout__sidebar-footer">
          <button class="client-layout__logout" (click)="onLogout()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main class="client-layout__main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .client-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    .client-layout__sidebar {
      width: 260px;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: var(--space-6) 0;
      flex-shrink: 0;
    }

    .client-layout__user {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 0 var(--space-5);
      margin-bottom: var(--space-6);
    }

    .client-layout__avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-circle);
      background: var(--color-apple-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .client-layout__avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .client-layout__avatar-initials {
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: #ffffff;
    }

    .client-layout__user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .client-layout__user-name {
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .client-layout__user-email {
      font-size: var(--text-micro);
      color: var(--text-tertiary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .client-layout__nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      padding: 0 var(--space-3);
      flex: 1;
    }

    .client-layout__nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-standard);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      letter-spacing: var(--tracking-link);
      transition: all var(--duration-fast) var(--ease-default);
    }
    .client-layout__nav-item svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    .client-layout__nav-item:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
    }
    .client-layout__nav-item.active {
      background: var(--hover-bg);
      color: var(--color-apple-blue);
      font-weight: var(--weight-semibold);
    }

    .client-layout__sidebar-footer {
      padding: 0 var(--space-3);
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: var(--space-4);
    }

    .client-layout__logout {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-standard);
      border: none;
      background: none;
      color: var(--color-error);
      font-size: var(--text-caption);
      font-weight: var(--weight-regular);
      cursor: pointer;
      width: 100%;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .client-layout__logout svg {
      width: 20px;
      height: 20px;
    }
    .client-layout__logout:hover {
      background: rgba(255, 59, 48, 0.08);
    }

    .client-layout__main {
      flex: 1;
      padding: var(--space-8);
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .client-layout {
        flex-direction: column;
      }
      .client-layout__sidebar {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
        padding: var(--space-3);
        border-right: none;
        border-bottom: 1px solid var(--border-color);
      }
      .client-layout__user,
      .client-layout__sidebar-footer {
        display: none;
      }
      .client-layout__nav {
        flex-direction: row;
        gap: var(--space-1);
      }
      .client-layout__nav-item span {
        display: none;
      }
      .client-layout__main {
        padding: var(--space-4);
      }
    }
  `]
})
export class ClientLayoutComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  getInitials(): string {
    const user = this.authService.user();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
