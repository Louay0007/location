import { Component, signal, inject, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle, VehicleImage } from '../../../core/models';

@Component({
  selector: 'app-vehicle-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-gallery.component.html',
  styleUrls: ['./vehicle-gallery.component.scss']
})
export class VehicleGalleryComponent {
  @Input() vehicle!: Vehicle;

  private readonly _selectedIndex = signal<number>(0);
  readonly selectedIndex = this._selectedIndex.asReadonly();

  private readonly _isFullscreen = signal<boolean>(false);
  readonly isFullscreen = this._isFullscreen.asReadonly();

  readonly images = computed(() => {
    if (this.vehicle.images && this.vehicle.images.length > 0) {
      return this.vehicle.images;
    }
    return this.vehicle.mainImageUrl
      ? [{ id: 0, vehicleId: this.vehicle.id, imageUrl: this.vehicle.mainImageUrl, sortOrder: 0 }]
      : [];
  });

  get currentImage(): VehicleImage | undefined {
    return this.images()[this._selectedIndex()];
  }

  selectImage(index: number): void {
    this._selectedIndex.set(index);
  }

  nextImage(): void {
    const max = this.images().length - 1;
    this._selectedIndex.set(this._selectedIndex() >= max ? 0 : this._selectedIndex() + 1);
  }

  previousImage(): void {
    const max = this.images().length - 1;
    this._selectedIndex.set(this._selectedIndex() <= 0 ? max : this._selectedIndex() - 1);
  }

  openFullscreen(): void {
    this._isFullscreen.set(true);
  }

  closeFullscreen(): void {
    this._isFullscreen.set(false);
  }

  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.previousImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
      case 'Escape':
        this.closeFullscreen();
        break;
    }
  }
}
