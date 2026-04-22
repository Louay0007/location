import { Component, inject, signal, computed, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehicleFilters, VehicleCategory, FuelType, TransmissionType } from '../../../core/models';

@Component({
  selector: 'app-vehicle-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vehicle-filters.component.html',
  styleUrls: ['./vehicle-filters.component.scss']
})
export class VehicleFiltersComponent {
  @Output() filtersChange = new EventEmitter<VehicleFilters>();
  @Output() clearFilters = new EventEmitter<void>();

  private readonly _filters = signal<VehicleFilters>({});
  readonly filters = this._filters.asReadonly();

  private readonly _expandedSections = signal<Set<string>>(new Set());
  readonly expandedSections = this._expandedSections.asReadonly();

  private readonly _selectedCategories = signal<Set<VehicleCategory>>(new Set());
  private readonly _selectedFuelTypes = signal<Set<FuelType>>(new Set());
  private readonly _selectedTransmissions = signal<Set<TransmissionType>>(new Set());

  readonly minPrice = signal<number>(0);
  readonly maxPrice = signal<number>(500);
  readonly minSeats = signal<number>(2);
  readonly maxSeats = signal<number>(9);

  @Input()
  set inputFilters(value: VehicleFilters) {
    this._filters.set(value || {});
  }

  @Input()
  set activeFilterCount(value: number) {
    // This is just for display, handled by parent
  }

  @Input() categories!: { value: VehicleCategory; label: string; icon: string }[];
  @Input() fuelTypes!: { value: FuelType; label: string; icon: string }[];
  @Input() transmissions!: { value: TransmissionType; label: string }[];

  toggleSection(section: string): void {
    this._expandedSections.update(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  isSectionExpanded(section: string): boolean {
    return this._expandedSections().has(section);
  }

  toggleCategory(category: VehicleCategory): void {
    const current = new Set(this._selectedCategories());
    if (current.has(category)) {
      current.delete(category);
    } else {
      current.add(category);
    }
    this._selectedCategories.set(current);
    this.emitFilters();
  }

  isCategorySelected(category: VehicleCategory): boolean {
    return this._selectedCategories().has(category);
  }

  toggleFuelType(fuelType: FuelType): void {
    const current = new Set(this._selectedFuelTypes());
    if (current.has(fuelType)) {
      current.delete(fuelType);
    } else {
      current.add(fuelType);
    }
    this._selectedFuelTypes.set(current);
    this.emitFilters();
  }

  isFuelTypeSelected(fuelType: FuelType): boolean {
    return this._selectedFuelTypes().has(fuelType);
  }

  toggleTransmission(transmission: TransmissionType): void {
    const current = new Set(this._selectedTransmissions());
    if (current.has(transmission)) {
      current.delete(transmission);
    } else {
      current.add(transmission);
    }
    this._selectedTransmissions.set(current);
    this.emitFilters();
  }

  isTransmissionSelected(transmission: TransmissionType): boolean {
    return this._selectedTransmissions().has(transmission);
  }

  onPriceRangeChange(): void {
    this.emitFilters();
  }

  onSeatsRangeChange(): void {
    this.emitFilters();
  }

  onClearAll(): void {
    this._selectedCategories.set(new Set());
    this._selectedFuelTypes.set(new Set());
    this._selectedTransmissions.set(new Set());
    this.minPrice.set(0);
    this.maxPrice.set(500);
    this.minSeats.set(2);
    this.maxSeats.set(9);
    this.clearFilters.emit();
  }

  private emitFilters(): void {
    const filters: VehicleFilters = {};

    if (this._selectedCategories().size > 0) {
      filters.category = Array.from(this._selectedCategories())[0]; // Single category for now
    }

    if (this._selectedFuelTypes().size > 0) {
      filters.fuelType = Array.from(this._selectedFuelTypes())[0];
    }

    if (this._selectedTransmissions().size > 0) {
      filters.transmission = Array.from(this._selectedTransmissions())[0];
    }

    if (this.minPrice() > 0) {
      filters.minPrice = this.minPrice();
    }

    if (this.maxPrice() < 500) {
      filters.maxPrice = this.maxPrice();
    }

    if (this.minSeats() > 2) {
      filters.minSeats = this.minSeats();
    }

    if (this.maxSeats() < 9) {
      filters.maxSeats = this.maxSeats();
    }

    this._filters.set(filters);
    this.filtersChange.emit(filters);
  }

  readonly hasActiveFilters = computed(() => {
    return (
      this._selectedCategories().size > 0 ||
      this._selectedFuelTypes().size > 0 ||
      this._selectedTransmissions().size > 0 ||
      this.minPrice() > 0 ||
      this.maxPrice() < 500 ||
      this.minSeats() > 2 ||
      this.maxSeats() < 9
    );
  });
}
