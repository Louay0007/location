// ═════════════════════════════════════════════════════════════════════════════════════════
// VEHICLES SERVICE — Vehicle Catalog & Management
// ═════════════════════════════════════════════════════════════════════════════════════════

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, map, switchMap, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import {
  Vehicle,
  VehicleFilters,
  VehicleImage,
  CreateBookingRequest,
  Booking,
  AvailabilityCheck,
  VehicleCategory,
  FuelType,
  TransmissionType
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private readonly api = inject(ApiService);

  // ─────────────────────────────────────────────────────────────────────────
  // State Management with Signals
  // ─────────────────────────────────────────────────────────────────────────

  private readonly _vehicles = signal<Vehicle[]>([]);
  private readonly _selectedVehicle = signal<Vehicle | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _totalCount = signal<number>(0);
  private readonly _currentPage = signal<number>(1);
  private readonly _totalPages = signal<number>(1);
  private readonly _filters = signal<VehicleFilters>({});

  readonly vehicles = this._vehicles.asReadonly();
  readonly selectedVehicle = this._selectedVehicle.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly hasNextPage = computed(() => this._currentPage() < this._totalPages());
  readonly hasPreviousPage = computed(() => this._currentPage() > 1);

  // ─────────────────────────────────────────────────────────────────────────
  // Category Options (Static)
  // ─────────────────────────────────────────────────────────────────────────

  readonly categories: { value: VehicleCategory; label: string; icon: string }[] = [
    { value: 'ECONOMY', label: 'Économique', icon: '🚗' },
    { value: 'COMPACT', label: 'Compacte', icon: '🚙' },
    { value: 'SEDAN', label: 'Berline', icon: '🚘' },
    { value: 'SUV', label: 'SUV', icon: '🚜' },
    { value: 'LUXURY', label: 'Luxe', icon: '🏎️' },
    { value: 'VAN', label: 'Van', icon: '🚐' }
  ];

  readonly fuelTypes: { value: FuelType; label: string; icon: string }[] = [
    { value: 'ESSENCE', label: 'Essence', icon: '⛽' },
    { value: 'DIESEL', label: 'Diesel', icon: '⛽' },
    { value: 'HYBRID', label: 'Hybride', icon: '🔋' },
    { value: 'ELECTRIC', label: 'Électrique', icon: '⚡' }
  ];

  readonly transmissions: { value: TransmissionType; label: string }[] = [
    { value: 'MANUAL', label: 'Manuelle' },
    { value: 'AUTOMATIC', label: 'Automatique' }
  ];

  readonly features = [
    'Climatisation',
    'Bluetooth',
    'Caméra de recul',
    'GPS',
    'Toit ouvrant',
    'Régulateur de vitesse',
    'ABS',
    'Airbags',
    'Vitres électriques',
    'Verrouillage centralisé'
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Public Catalog Methods
  // ─────────────────────────────────────────────────────────────────────────

  getVehicles(filters: VehicleFilters = {}): Observable<Vehicle[]> {
    this._isLoading.set(true);
    this._filters.set(filters);

    return this.api.get<Vehicle[]>('/vehicles', filters).pipe(
      tap(response => {
        const vehicles = Array.isArray(response.data) ? response.data : [];
        this._vehicles.set(vehicles);
        this._totalCount.set(response.meta?.total ?? vehicles.length);
        this._currentPage.set(response.meta?.page ?? 1);
        this._totalPages.set(response.meta?.totalPages ?? 1);
        this._isLoading.set(false);
      }),
      map(response => response.data as Vehicle[])
    );
  }

  getVehicle(id: number): Observable<Vehicle> {
    this._isLoading.set(true);
    return this.api.getRaw<Vehicle>(`/vehicles/${id}`).pipe(
      tap(vehicle => {
        this._selectedVehicle.set(vehicle);
        this._isLoading.set(false);
      })
    );
  }

  getAvailability(id: number, year: number, month: number): Observable<{ bookedPeriods: any[]; maintenancePeriods: any[] }> {
    return this.api.getRaw<{ bookedPeriods: any[]; maintenancePeriods: any[] }>(
      `/vehicles/${id}/availability`,
      { year, month }
    );
  }

  checkAvailability(check: AvailabilityCheck): Observable<{ available: number; vehicles: Vehicle[] }> {
    return this.api.postRaw<{ available: number; vehicles: Vehicle[] }>(
      '/vehicles/availability/check',
      check
    );
  }

  getCategories(): Observable<string[]> {
    return this.api.getRaw<string[]>('/vehicles/categories');
  }

  getCategoryCounts(): Observable<{ category: string; count: number }[]> {
    return this.api.getRaw<{ category: string; count: number }[]>('/vehicles/categories/counts');
  }

  getFleetStats(): Observable<{ vehicleCount: number; bookingCount: number; clientCount: number }> {
    return this.api.getRaw<{ vehicleCount: number; bookingCount: number; clientCount: number }>('/vehicles/fleet-stats');
  }

  getFeaturedVehicles(limit: number = 6): Observable<Vehicle[]> {
    return this.api.getRaw<Vehicle[]>(
      '/vehicles',
      { limit, status: 'AVAILABLE' }
    );
  }

  getVehicleByCategory(category: VehicleCategory): Observable<Vehicle[]> {
    return this.api.getRaw<Vehicle[]>('/vehicles', { category, limit: 12 });
  }

  getRelatedVehicles(vehicleId: number, limit: number = 4): Observable<Vehicle[]> {
    return this.getVehicle(vehicleId).pipe(
      switchMap(vehicle => this.getVehicleByCategory(vehicle.category)),
      map(vehicles => vehicles.filter((v: Vehicle) => v.id !== vehicleId).slice(0, limit))
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────────────────────────────────────

  loadPage(page: number): void {
    const currentFilters = this._filters();
    this.getVehicles({ ...currentFilters, page }).subscribe();
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.loadPage(this._currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.loadPage(this._currentPage() - 1);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Filtering Helpers
  // ─────────────────────────────────────────────────────────────────────────

  clearFilters(): void {
    this._filters.set({});
    this.getVehicles().subscribe();
  }

  updateFilters(partial: Partial<VehicleFilters>): void {
    const current = this._filters();
    this.getVehicles({ ...current, ...partial, page: 1 }).subscribe();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // State Reset
  // ─────────────────────────────────────────────────────────────────────────

  clearSelection(): void {
    this._selectedVehicle.set(null);
  }

  clearAll(): void {
    this._vehicles.set([]);
    this._selectedVehicle.set(null);
    this._totalCount.set(0);
    this._currentPage.set(1);
    this._totalPages.set(1);
    this._filters.set({});
  }
}