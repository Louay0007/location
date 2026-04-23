// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS SERVICE — User Notifications API
// ═══════════════════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Notification, NotificationCount, PaginationMeta } from '../models';

export interface NotificationListResponse {
  data: Notification[];
  meta: PaginationMeta;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private readonly api: ApiService) {}

  getUserNotifications(params?: { page?: number; limit?: number }): Observable<NotificationListResponse> {
    return this.api.getRaw<NotificationListResponse>('/notifications', params);
  }

  markAllAsRead(): Observable<void> {
    return this.api.patchRaw<void>('/notifications/read-all', {});
  }

  markAsRead(id: number): Observable<void> {
    return this.api.patchRaw<void>(`/notifications/${id}/read`, {});
  }

  getUnreadCount(): Observable<NotificationCount> {
    return this.api.getRaw<NotificationCount>('/notifications/unread-count');
  }
}
