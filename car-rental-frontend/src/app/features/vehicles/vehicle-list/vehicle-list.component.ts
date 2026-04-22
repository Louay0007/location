import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { Vehicle, VehicleFilters, VehicleCategory, FuelType, TransmissionType } from '../../../core/models';
import { VehicleCardComponent } from '../../../features/landing/components/vehicle-card.component';
import { VehicleFiltersComponent } from './vehicle-filters.component';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterModule, VehicleCardComponent, VehicleFiltersComponent],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss']
})
export class VehicleListComponent implements OnInit {
  private readonly vehiclesService = inject(VehiclesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly vehicles = this.vehiclesService.vehicles;
  readonly isLoading = this.vehiclesService.isLoading;
  readonly totalCount = this.vehiclesService.totalCount;
  readonly currentPage = this.vehiclesService.currentPage;
  readonly totalPages = this.vehiclesService.totalPages;
  readonly hasNextPage = this.vehiclesService.hasNextPage;
  readonly hasPreviousPage = this.vehiclesService.hasPreviousPage;

  readonly categories = this.vehiclesService.categories;
  readonly fuelTypes = this.vehiclesService.fuelTypes;
  readonly transmissions = this.vehiclesService.transmissions;

  private readonly _selectedFilters = signal<VehicleFilters>({});
  readonly selectedFilters = this._selectedFilters.asReadonly();

  private readonly _hasError = signal(false);
  readonly hasError = this._hasError.asReadonly();

  readonly activeFilterCount = computed(() => {
    const f = this._selectedFilters();
    return Object.values(f).filter(v => v !== undefined && v !== null && v !== '').length;
  });

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(filters?: VehicleFilters): void {
    this._hasError.set(false);
    this.vehiclesService.getVehicles(filters || this._selectedFilters()).subscribe({
      error: () => this._hasError.set(true)
    });
  }

  retryLoad(): void {
    this.loadVehicles();
  }

  onFiltersChange(filters: VehicleFilters): void {
    this._selectedFilters.set(filters);
    this.loadVehicles({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._selectedFilters.set({});
    this.vehiclesService.clearFilters();
  }

  nextPage(): void {
    this.vehiclesService.nextPage();
  }

  previousPage(): void {
    this.vehiclesService.previousPage();
  }

  goToPage(page: number): void {
    this.vehiclesService.loadPage(page);
  }

  onVehicleClick(vehicle: Vehicle): void {
    this.router.navigate(['/vehicles', vehicle.id]);
  }
}
