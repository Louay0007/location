import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { Vehicle, VehicleCategory, FuelType, TransmissionType } from '../../../core/models';
import { VehicleGalleryComponent } from './vehicle-gallery.component';
import { VehicleSpecsComponent } from './vehicle-specs.component';
import { VehicleCalendarComponent } from './vehicle-calendar.component';
import { BookingFormComponent } from './booking-form.component';
import { VehicleCardComponent } from '../../landing/components/vehicle-card.component';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VehicleGalleryComponent,
    VehicleSpecsComponent,
    VehicleCalendarComponent,
    BookingFormComponent,
    VehicleCardComponent
  ],
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.scss']
})
export class VehicleDetailComponent implements OnInit {
  private readonly vehiclesService = inject(VehiclesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly vehicle = this.vehiclesService.selectedVehicle;
  readonly isLoading = this.vehiclesService.isLoading;

  private readonly _selectedDates = signal<{ startDate: string; endDate: string } | null>(null);
  readonly selectedDates = this._selectedDates.asReadonly();

  private readonly _showBookingForm = signal(false);
  readonly showBookingForm = this._showBookingForm.asReadonly();

  private readonly _relatedVehicles = signal<Vehicle[]>([]);
  readonly relatedVehicles = this._relatedVehicles.asReadonly();

  private readonly _isLoadingRelated = signal(false);
  readonly isLoadingRelated = this._isLoadingRelated.asReadonly();

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.vehiclesService.getVehicle(id).subscribe();
      this.loadRelatedVehicles(id);
    }
  }

  private loadRelatedVehicles(vehicleId: number): void {
    this._isLoadingRelated.set(true);
    this.vehiclesService.getRelatedVehicles(vehicleId, 3).subscribe({
      next: (vehicles) => {
        this._relatedVehicles.set(vehicles);
        this._isLoadingRelated.set(false);
      },
      error: () => this._isLoadingRelated.set(false)
    });
  }

  onDatesSelected(dates: { startDate: string; endDate: string }): void {
    this._selectedDates.set(dates);
    this._showBookingForm.set(true);
  }

  onBookNow(): void {
    this._showBookingForm.set(true);
  }

  onBookingSuccess(bookingId: number): void {
    this.router.navigate(['/booking/confirmation', bookingId]);
  }

  getCategoryLabel(category: VehicleCategory): string {
    const labels: Record<VehicleCategory, string> = {
      'ECONOMY': 'Économique',
      'COMPACT': 'Compacte',
      'SEDAN': 'Berline',
      'SUV': 'SUV',
      'LUXURY': 'Luxe',
      'VAN': 'Van'
    };
    return labels[category] || category;
  }

  getFuelLabel(fuel: FuelType): string {
    const labels: Record<FuelType, string> = {
      'ESSENCE': 'Essence',
      'DIESEL': 'Diesel',
      'HYBRID': 'Hybride',
      'ELECTRIC': 'Électrique'
    };
    return labels[fuel] || fuel;
  }

  getTransmissionLabel(transmission: TransmissionType): string {
    const labels: Record<TransmissionType, string> = {
      'MANUAL': 'Manuelle',
      'AUTOMATIC': 'Automatique'
    };
    return labels[transmission] || transmission;
  }

  formatPrice(price: number | string): string {
    return `${Number(price).toFixed(2)} TND`;
  }

  goBack(): void {
    this.router.navigate(['/vehicles']);
  }

  onVehicleClick(vehicle: Vehicle): void {
    this.router.navigate(['/vehicles', vehicle.id]);
    // Reload related vehicles for the new vehicle
    this.loadRelatedVehicles(vehicle.id);
  }
}
