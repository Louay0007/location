// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE SERVICE — Maintenance Records & Alerts
// ═══════════════════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { MaintenanceRecord, MaintenanceAlert } from '../models';

export interface CreateMaintenanceRequest {
  vehicleId: number;
  type: 'ROUTINE' | 'REPAIR' | 'INSPECTION';
  description: string;
  scheduledDate: string;
  estimatedCost?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  constructor(private readonly api: ApiService) {}

  getAllMaintenanceRecords(vehicleId?: number): Observable<MaintenanceRecord[]> {
    const params = vehicleId ? { vehicleId } : undefined;
    return this.api.getRaw<MaintenanceRecord[]>('/maintenance/admin', params);
  }

  getMaintenanceAlerts(): Observable<MaintenanceAlert[]> {
    return this.api.getRaw<MaintenanceAlert[]>('/maintenance/admin/alerts');
  }

  getUpcomingMaintenance(days: number = 7): Observable<MaintenanceRecord[]> {
    return this.api.getRaw<MaintenanceRecord[]>('/maintenance/admin/upcoming', { days });
  }

  getOverdueMaintenance(): Observable<MaintenanceRecord[]> {
    return this.api.getRaw<MaintenanceRecord[]>('/maintenance/admin/overdue');
  }

  getVehicleMaintenanceHistory(vehicleId: number): Observable<MaintenanceRecord[]> {
    return this.api.getRaw<MaintenanceRecord[]>(`/maintenance/admin/vehicle/${vehicleId}`);
  }

  getMaintenanceRecordById(id: number): Observable<MaintenanceRecord> {
    return this.api.getRaw<MaintenanceRecord>(`/maintenance/admin/${id}`);
  }

  createMaintenanceRecord(data: CreateMaintenanceRequest): Observable<MaintenanceRecord> {
    return this.api.postRaw<MaintenanceRecord>('/maintenance/admin', data);
  }

  updateMaintenanceRecord(id: number, data: Partial<CreateMaintenanceRequest>): Observable<MaintenanceRecord> {
    return this.api.putRaw<MaintenanceRecord>(`/maintenance/admin/${id}`, data);
  }

  deleteMaintenanceRecord(id: number): Observable<void> {
    return this.api.deleteRaw<void>(`/maintenance/admin/${id}`);
  }
}
