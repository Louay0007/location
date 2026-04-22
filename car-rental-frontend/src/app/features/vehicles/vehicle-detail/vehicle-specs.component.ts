import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle, VehicleCategory, FuelType, TransmissionType } from '../../../core/models';

@Component({
  selector: 'app-vehicle-specs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-specs.component.html',
  styleUrls: ['./vehicle-specs.component.scss']
})
export class VehicleSpecsComponent {
  @Input() vehicle!: Vehicle;

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

  readonly specItems = computed(() => [
    { icon: 'calendar', label: 'Année', value: this.vehicle.year.toString() },
    { icon: 'users', label: 'Places', value: this.vehicle.seats.toString() },
    { icon: 'door', label: 'Portes', value: this.vehicle.doors.toString() },
    { icon: 'settings', label: 'Transmission', value: this.getTransmissionLabel(this.vehicle.transmission) },
    { icon: 'fuel', label: 'Carburant', value: this.getFuelLabel(this.vehicle.fuelType) },
    { icon: 'gauge', label: 'Kilométrage', value: `${this.vehicle.mileage.toLocaleString()} km` },
    { icon: 'shield', label: 'Caution', value: `${Number(this.vehicle.depositAmount).toFixed(2)} TND` }
  ]);

  readonly featureGroups = computed(() => {
    const features = this.vehicle.features || [];
    return {
      comfort: features.filter(f => ['Climatisation', 'GPS', 'Régulateur de vitesse', 'Toit ouvrant'].includes(f)),
      safety: features.filter(f => ['ABS', 'Airbags', 'Caméra de recul'].includes(f)),
      technology: features.filter(f => ['Bluetooth', 'Vitres électriques', 'Verrouillage centralisé'].includes(f))
    };
  });
}
