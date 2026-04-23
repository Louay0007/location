// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE — Client Notification Center
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../../core/models';
import { NotificationService } from '../../../core/services/notifications.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications">
      <div class="notifications__header">
        <h1 class="notifications__title">Notifications</h1>
        @if (notifications().length > 0) {
          <button class="notifications__mark-all" (click)="markAllRead()">
            Tout marquer comme lu
          </button>
        }
      </div>

      @if (notifications().length === 0) {
        <div class="notifications__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <p>Aucune notification.</p>
        </div>
      } @else {
        <div class="notifications__list">
          @for (notification of notifications(); track notification.id) {
            <div
              class="notification-item"
              [class.notification-item--unread]="!notification.isRead"
              (click)="markRead(notification)"
            >
              <div class="notification-item__dot" [class.notification-item__dot--unread]="!notification.isRead"></div>
              <div class="notification-item__content">
                <span class="notification-item__title">{{ notification.title }}</span>
                <span class="notification-item__message">{{ notification.message }}</span>
                <span class="notification-item__time">{{ getTimeAgo(notification.createdAt) }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications {
      max-width: 600px;
    }

    .notifications__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-6);
    }

    .notifications__title {
      font-family: var(--font-display);
      font-size: var(--text-section);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-section);
      margin: 0;
    }

    .notifications__mark-all {
      font-size: var(--text-micro);
      color: var(--color-apple-blue);
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-body);
    }
    .notifications__mark-all:hover {
      text-decoration: underline;
    }

    /* ── Empty ── */
    .notifications__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-10);
      text-align: center;
      color: var(--text-tertiary);
    }
    .notifications__empty svg {
      width: 40px;
      height: 40px;
      opacity: 0.48;
    }

    /* ── List ── */
    .notifications__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      border-radius: var(--radius-standard);
      cursor: pointer;
      transition: background var(--duration-fast) var(--ease-default);
    }
    .notification-item:hover {
      background: var(--hover-bg);
    }
    .notification-item--unread {
      background: var(--bg-secondary);
    }

    .notification-item__dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-circle);
      background: transparent;
      margin-top: var(--space-2);
      flex-shrink: 0;
    }
    .notification-item__dot--unread {
      background: var(--color-apple-blue);
    }

    .notification-item__content {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .notification-item__title {
      font-size: var(--text-caption);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .notification-item__message {
      font-size: var(--text-micro);
      color: var(--text-secondary);
      line-height: var(--leading-micro);
    }

    .notification-item__time {
      font-size: var(--text-nano);
      color: var(--text-tertiary);
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly toastService = inject(ToastService);

  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this._isLoading.set(true);
    this.notificationService.getUserNotifications().subscribe({
      next: (response) => {
        this._notifications.set(response.data);
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des notifications');
      }
    }).add(() => {
      this._isLoading.set(false);
    });
  }

  markRead(notification: Notification): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this._notifications.update(list =>
          list.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      },
      error: () => {
        this.toastService.error('Erreur lors du marquage comme lu');
      }
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this._notifications.update(list =>
          list.map(n => ({ ...n, isRead: true }))
        );
        this.toastService.success('Toutes les notifications marquées comme lues');
      },
      error: () => {
        this.toastService.error('Erreur lors du marquage de toutes les notifications');
      }
    });
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return then.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
