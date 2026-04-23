// ═══════════════════════════════════════════════════════════════════════════
// ADMIN USERS SERVICE — User Management (Admin)
// ═══════════════════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { User, UserStats, PaginationMeta } from '../models';

export interface FilterUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface UserListResponse {
  data: User[];
  meta: PaginationMeta;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  constructor(private readonly api: ApiService) {}

  getAllUsers(params?: FilterUsersParams): Observable<UserListResponse> {
    return this.api.getRaw<UserListResponse>('/users/admin', params);
  }

  getUserById(id: number): Observable<User> {
    return this.api.getRaw<User>(`/users/admin/${id}`);
  }

  toggleUserStatus(id: number): Observable<User> {
    return this.api.patchRaw<User>(`/users/admin/${id}/status`, {});
  }

  getUserStats(userId: number): Observable<UserStats> {
    return this.api.getRaw<UserStats>('/users/me/stats');
  }
}
